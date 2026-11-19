from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class DigitalVulnerabilitySchema(BaseModel):
    area: Literal["MOBILE", "PERFORMANCE", "SECURITY_SSL", "MISSING_WEBSITE", "CONVERSION_LEADS", "SEO"]
    severity: Literal["HIGH", "MEDIUM", "LOW"]
    observation: str
    business_impact: str

class SuggestedFeatureSchema(BaseModel):
    feature_name: str
    value_proposition: str
    estimated_complexity: Literal["SIMPLE", "MODERATE", "ADVANCED"]

class AIAnalysisDTO(BaseModel):
    business_summary: str
    identified_niche: Optional[str] = None
    qualification_status: Literal["QUALIFIED", "MARGINAL", "DISQUALIFIED"] = "QUALIFIED"
    qualification_reason: Optional[str] = None
    digital_vulnerabilities: List[DigitalVulnerabilitySchema] = []
    suggested_features: List[SuggestedFeatureSchema] = []
    agency_value_proposition: str

class WebsiteAuditDTO(BaseModel):
    website_url: Optional[str] = None
    website_status: Literal["NO_WEBSITE", "SOCIAL_ONLY", "BROKEN_OR_INACTIVE", "ACTIVE_OFFICIAL"]
    social_platform: Optional[str] = None
    performance_score: int = 0
    accessibility_score: int = 0
    seo_score: int = 0
    mobile_responsive: bool = False
    has_valid_ssl: bool = False
    first_contentful_paint_ms: int = 0
    largest_contentful_paint_ms: int = 0
    cms_detected: Optional[str] = None
    technical_issues_summary: Optional[str] = None

class OpportunityScoreDTO(BaseModel):
    total_score: int
    website_deficit: int
    commercial_viability: int
    contact_access: int
    agency_fit: int
    deficit_reason: Optional[str] = None
    viability_reason: Optional[str] = None
    contact_reason: Optional[str] = None
    fit_reason: Optional[str] = None

class ContactDTO(BaseModel):
    email: Optional[str] = None
    phone: str
    verification_status: Literal["VERIFIED_DELIVERABLE", "ACCEPT_ALL_UNVERIFIED", "NO_MX_RECORDS", "UNAVAILABLE"] = "UNAVAILABLE"
    primary_mx_host: Optional[str] = None
    source_url: Optional[str] = None
    confidence_score: float = 0.5

class BusinessLeadDTO(BaseModel):
    id: str
    name: str = Field(..., alias="name")
    category: str
    locality: Optional[str] = ""
    city: str
    state: Optional[str] = ""
    country: str = "India"
    latitude: float
    longitude: float
    star_rating: float = 4.0
    review_count: int = 0
    price_level: int = 2
    status: Literal["NEW", "AUDITED", "CONTACTED", "CONVERTED", "REJECTED"] = "NEW"
    is_high_urgency: bool = False
    audit: WebsiteAuditDTO
    score: OpportunityScoreDTO
    ai_analysis: AIAnalysisDTO
    contact: ContactDTO
    created_at: str

    class Config:
        populate_by_name = True

class SearchRequestDTO(BaseModel):
    city: str = "Mumbai"
    category: str = "Clinics & Healthcare"
    radius_km: float = 10.0
    source: Literal["OPENSTREETMAP", "GOOGLE_PLACES"] = "OPENSTREETMAP"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class GeneratePitchRequestDTO(BaseModel):
    angle: Literal["GROWTH_MISSED_REVENUE", "DIRECT_TECHNICAL_FLAW", "COMPETITOR_COMPARISON"] = "GROWTH_MISSED_REVENUE"
    tone: Literal["consultative", "technical", "direct"] = "consultative"

class EmailDraftDTO(BaseModel):
    model_config = {"protected_namespaces": ()}
    id: str
    business_id: str
    angle: str
    subject_lines: List[str]
    selected_subject: str
    body_markdown: str
    model_used: str

class UpdateStatusRequestDTO(BaseModel):
    status: Literal["NEW", "AUDITED", "CONTACTED", "CONVERTED", "REJECTED"]
