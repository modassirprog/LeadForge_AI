from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.entities import Business, WebsiteAudit, OpportunityScore, APIUsageLog

router = APIRouter()

@router.get("")
def get_system_analytics(db: Session = Depends(get_db)):
    """
    Returns high-level CRM and pipeline analytics.
    """
    businesses = db.query(Business).all()

    total = len(businesses)
    urgent = sum(1 for b in businesses if b.score and b.score.total_score >= 80)
    no_web = sum(1 for b in businesses if b.audit and b.audit.website_status == "NO_WEBSITE")
    social_only = sum(1 for b in businesses if b.audit and b.audit.website_status == "SOCIAL_ONLY")
    contacted = sum(1 for b in businesses if b.status == "CONTACTED")
    converted = sum(1 for b in businesses if b.status == "CONVERTED")

    avg_score = (
        round(sum(b.score.total_score for b in businesses if b.score) / total, 1)
        if total > 0
        else 0
    )

    logs = db.query(APIUsageLog).all()
    total_tokens = sum((l.tokens_in + l.tokens_out) for l in logs)
    total_cost = round(sum(l.cost_usd for l in logs), 4)

    return {
        "total_leads": total,
        "urgent_leads": urgent,
        "missing_website_count": no_web,
        "social_only_count": social_only,
        "contacted_count": contacted,
        "converted_count": converted,
        "average_opportunity_score": avg_score,
        "total_api_tokens_used": total_tokens,
        "total_api_spend_usd": total_cost,
        "api_gateway": "OpenRouter"
    }
