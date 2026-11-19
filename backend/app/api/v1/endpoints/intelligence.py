from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
import logging

from backend.app.core.database import get_db
from backend.app.models.entities import Business, WebsiteAudit, OpportunityScore, Contact, EmailDraft, APIUsageLog
from backend.app.schemas.dtos import GeneratePitchRequestDTO
from backend.app.services.outreach.generator import OutreachPitchGenerator
from backend.app.services.auditing.html_inspector import HTMLInspectorService
from backend.app.services.auditing.pagespeed import PageSpeedAuditorService
from backend.app.services.scoring.engine import OpportunityScoringEngine

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/{business_id}/generate-pitch")
async def generate_pitch_for_business(
    business_id: str,
    payload: GeneratePitchRequestDTO,
    db: Session = Depends(get_db)
):
    """
    Generates 3 subject lines and an editable personalized outreach email
    grounded strictly in the business's technical audit metrics via OpenRouter.
    """
    b = db.query(Business).filter(Business.id == business_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Business not found")

    audit = b.audit
    audit_summary = audit.technical_issues_summary if audit else "Missing website"
    web_status = audit.website_status if audit else "NO_WEBSITE"

    pitch_data = await OutreachPitchGenerator.generate_pitch(
        business_name=b.name,
        category=b.category,
        city=b.city,
        locality=b.locality or "Central",
        star_rating=b.star_rating,
        review_count=b.review_count,
        website_status=web_status,
        audit_summary=audit_summary,
        angle=payload.angle,
        tone=payload.tone
    )

    # Save EmailDraft record
    draft = EmailDraft(
        business_id=b.id,
        angle=payload.angle,
        subject_lines_json=json.dumps(pitch_data["subject_lines"]),
        selected_subject=pitch_data["selected_subject"],
        body_markdown=pitch_data["body_markdown"],
        model_used="openrouter/unified-gateway"
    )
    db.add(draft)

    # Log API Usage
    log = APIUsageLog(
        provider="OPENROUTER",
        endpoint="/chat/completions",
        tokens_in=pitch_data.get("tokens_used", 0) // 2,
        tokens_out=pitch_data.get("tokens_used", 0) // 2,
        cost_usd=pitch_data.get("cost_usd", 0.0),
        duration_ms=450
    )
    db.add(log)
    db.commit()

    return {
        "status": "success",
        "business_id": b.id,
        "angle": payload.angle,
        "tone": payload.tone,
        "subject_lines": pitch_data["subject_lines"],
        "selected_subject": pitch_data["selected_subject"],
        "body_markdown": pitch_data["body_markdown"],
        "tokens_used": pitch_data.get("tokens_used", 0),
        "cost_usd": pitch_data.get("cost_usd", 0.0)
    }

@router.post("/{business_id}/audit")
async def trigger_on_demand_audit(
    business_id: str,
    db: Session = Depends(get_db)
):
    """
    Triggers an on-demand re-audit of the business website using HTML inspection
    and Google PageSpeed Insights, and updates the Opportunity Score.
    """
    b = db.query(Business).filter(Business.id == business_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Business not found")

    target_url = b.audit.website_url if (b.audit and b.audit.website_url) else None

    # Run HTML inspector
    new_audit_data = await HTMLInspectorService.inspect_website(target_url)

    # Run Google PageSpeed if URL exists
    if new_audit_data["website_status"] == "ACTIVE_OFFICIAL" and target_url:
        ps_data = await PageSpeedAuditorService.audit_url(target_url)
        if ps_data:
            new_audit_data["performance_score"] = ps_data["performance_score"]
            new_audit_data["accessibility_score"] = ps_data["accessibility_score"]
            new_audit_data["seo_score"] = ps_data["seo_score"]
            new_audit_data["first_contentful_paint_ms"] = ps_data["first_contentful_paint_ms"]
            new_audit_data["largest_contentful_paint_ms"] = ps_data["largest_contentful_paint_ms"]

    # Update or create WebsiteAudit
    if b.audit:
        for k, v in new_audit_data.items():
            setattr(b.audit, k, v)
    else:
        new_audit = WebsiteAudit(business_id=b.id, **new_audit_data)
        db.add(new_audit)

    # Recalculate Opportunity Score
    has_email = bool(b.contact and b.contact.email)
    is_verified = bool(b.contact and b.contact.verification_status == "VERIFIED_DELIVERABLE")

    new_score_data = OpportunityScoringEngine.calculate_opportunity_score(
        category=b.category,
        website_status=new_audit_data["website_status"],
        is_mobile_responsive=new_audit_data["mobile_responsive"],
        performance_score=new_audit_data["performance_score"],
        has_ssl=new_audit_data["has_valid_ssl"],
        star_rating=b.star_rating,
        review_count=b.review_count,
        has_phone=bool(b.phone),
        has_email=has_email,
        is_email_verified=is_verified
    )

    if b.score:
        for k, v in new_score_data.items():
            setattr(b.score, k, v)
    else:
        new_score = OpportunityScore(business_id=b.id, **new_score_data)
        db.add(new_score)

    b.status = "AUDITED"
    db.commit()

    return {
        "status": "success",
        "business_id": b.id,
        "audit": new_audit_data,
        "score": new_score_data
    }
