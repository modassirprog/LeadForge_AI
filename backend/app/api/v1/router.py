from fastapi import APIRouter
from backend.app.api.v1.endpoints import discovery, businesses, intelligence, analytics

api_router = APIRouter()

api_router.include_router(discovery.router, prefix="/discovery", tags=["Discovery Engine"])
api_router.include_router(businesses.router, prefix="/businesses", tags=["Lead CRM Repository"])
api_router.include_router(intelligence.router, prefix="/businesses", tags=["AI Intelligence & Audits"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Pipeline Analytics"])
