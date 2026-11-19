from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from backend.app.core.database import get_db
from backend.app.models.entities import Business, WebsiteAudit, OpportunityScore, Contact, AIAnalysis
from backend.app.schemas.dtos import UpdateStatusRequestDTO

router = APIRouter()

def serialize_business_to_dto(b: Business) -> dict:
    audit = b.audit
    score = b.score
    contact = b.contact
    ai = b.ai_analysis

    vulns = []
    features = []
    if ai:
        try:
            vulns = json.loads(ai.digital_vulnerabilities_json or "[]")
            features = json.loads(ai.suggested_features_json or "[]")
        except Exception:
            pass

    return {
        "id": b.id,
        "name": b.name,
        "category": b.category,
        "locality": b.locality or "Central",
        "city": b.city,
        "state": b.state or "",
        "country": b.country,
        "latitude": b.latitude,
        "longitude": b.longitude,
        "star_rating": b.star_rating,
        "review_count": b.review_count,
        "price_level": b.price_level,
        "status": b.status,
        "is_high_urgency": bool(score and score.total_score >= 80),
        "audit": {
            "website_url": audit.website_url if audit else None,
            "website_status": audit.website_status if audit else "NO_WEBSITE",
            "social_platform": audit.social_platform if audit else None,
            "performance_score": audit.performance_score if audit else 0,
            "accessibility_score": audit.accessibility_score if audit else 0,
            "seo_score": audit.seo_score if audit else 0,
            "mobile_responsive": audit.mobile_responsive if audit else False,
            "has_valid_ssl": audit.has_valid_ssl if audit else False,
            "first_contentful_paint_ms": audit.first_contentful_paint_ms if audit else 0,
            "largest_contentful_paint_ms": audit.largest_contentful_paint_ms if audit else 0,
            "cms_detected": audit.cms_detected if audit else None,
            "technical_issues_summary": audit.technical_issues_summary if audit else None,
        },
        "score": {
            "total_score": score.total_score if score else 50,
            "website_deficit": score.website_deficit if score else 0,
            "commercial_viability": score.commercial_viability if score else 0,
            "contact_access": score.contact_access if score else 0,
            "agency_fit": score.agency_fit if score else 0,
            "deficit_reason": score.deficit_reason if score else None,
            "viability_reason": score.viability_reason if score else None,
            "contact_reason": score.contact_reason if score else None,
            "fit_reason": score.fit_reason if score else None,
        },
        "contact": {
            "email": contact.email if contact else None,
            "phone": contact.phone if contact else (b.phone or "N/A"),
            "verification_status": contact.verification_status if contact else "UNAVAILABLE",
            "primary_mx_host": contact.primary_mx_host if contact else None,
            "source_url": contact.source_url if contact else None,
            "confidence_score": contact.confidence_score if contact else 0.5,
        },
        "ai_analysis": {
            "business_summary": ai.business_summary if ai else f"{b.name} is an active {b.category} in {b.city}.",
            "identified_niche": ai.identified_niche if ai else b.category,
            "qualification_status": ai.qualification_status if ai else "QUALIFIED",
            "qualification_reason": ai.qualification_reason if ai else "Active establishment",
            "digital_vulnerabilities": vulns,
            "suggested_features": features,
            "agency_value_proposition": ai.agency_value_proposition if ai else "Provide digital web development.",
        },
        "created_at": b.created_at.isoformat() if b.created_at else ""
    }

@router.get("", response_model=List[dict])
def list_businesses(
    city: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    min_score: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Retrieves all discovered business leads with filtering.
    """
    query = db.query(Business).order_by(Business.created_at.desc())

    if city and city not in ("All Cities", "My Location", "Current Location"):
        query = query.filter(Business.city.ilike(f"%{city}%"))
    if category and category not in ("All Categories", "All Businesses & Shops", "All"):
        query = query.filter(Business.category.ilike(f"%{category}%"))
    if status and status != "ALL":
        query = query.filter(Business.status == status)

    businesses = query.all()

    filtered = []
    for b in businesses:
        if min_score is not None and b.score and b.score.total_score < min_score:
            continue
        if search:
            q = search.lower()
            if q not in b.name.lower() and q not in (b.locality or "").lower():
                continue

        filtered.append(serialize_business_to_dto(b))

    return filtered

@router.get("/{business_id}", response_model=dict)
def get_business_by_id(
    business_id: str,
    db: Session = Depends(get_db)
):
    b = db.query(Business).filter(Business.id == business_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Business not found")
    return serialize_business_to_dto(b)

@router.patch("/{business_id}/status")
def update_business_status(
    business_id: str,
    payload: UpdateStatusRequestDTO,
    db: Session = Depends(get_db)
):
    b = db.query(Business).filter(Business.id == business_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Business not found")

    b.status = payload.status
    db.commit()
    return {"status": "success", "business_id": business_id, "new_status": payload.status}

@router.delete("")
def delete_all_businesses(
    db: Session = Depends(get_db)
):
    """Deletes all businesses from database to start fresh."""
    count = db.query(Business).count()
    db.query(AIAnalysis).delete()
    db.query(Contact).delete()
    db.query(OpportunityScore).delete()
    db.query(WebsiteAudit).delete()
    db.query(Business).delete()
    db.commit()
    return {"status": "success", "deleted_count": count}

@router.delete("/{business_id}")
def delete_business(
    business_id: str,
    db: Session = Depends(get_db)
):
    b = db.query(Business).filter(Business.id == business_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Business not found")

    db.delete(b)
    db.commit()
    return {"status": "success", "deleted_id": business_id}
