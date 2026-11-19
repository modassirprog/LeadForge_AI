from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Business(Base):
    __tablename__ = "businesses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    dedup_hash = Column(String(64), unique=True, index=True, nullable=False)
    google_place_id = Column(String(255), unique=True, nullable=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    locality = Column(String(100), nullable=True)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=False, default="India")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    star_rating = Column(Float, default=4.0)
    review_count = Column(Integer, default=0)
    price_level = Column(Integer, default=2)
    phone = Column(String(50), nullable=True)
    status = Column(String(50), default="NEW", index=True) # NEW, AUDITED, CONTACTED, CONVERTED, REJECTED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    audit = relationship("WebsiteAudit", back_populates="business", uselist=False, cascade="all, delete-orphan")
    score = relationship("OpportunityScore", back_populates="business", uselist=False, cascade="all, delete-orphan")
    contact = relationship("Contact", back_populates="business", uselist=False, cascade="all, delete-orphan")
    ai_analysis = relationship("AIAnalysis", back_populates="business", uselist=False, cascade="all, delete-orphan")
    email_drafts = relationship("EmailDraft", back_populates="business", cascade="all, delete-orphan")


class WebsiteAudit(Base):
    __tablename__ = "website_audits"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), unique=True, nullable=False)
    website_url = Column(Text, nullable=True)
    website_status = Column(String(50), default="NO_WEBSITE", index=True) # NO_WEBSITE, SOCIAL_ONLY, BROKEN_OR_INACTIVE, ACTIVE_OFFICIAL
    social_platform = Column(String(50), nullable=True)
    performance_score = Column(Integer, default=0)
    accessibility_score = Column(Integer, default=0)
    seo_score = Column(Integer, default=0)
    mobile_responsive = Column(Boolean, default=False)
    has_valid_ssl = Column(Boolean, default=False)
    first_contentful_paint_ms = Column(Integer, default=0)
    largest_contentful_paint_ms = Column(Integer, default=0)
    cms_detected = Column(String(100), nullable=True)
    technical_issues_summary = Column(Text, nullable=True)
    audited_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="audit")


class OpportunityScore(Base):
    __tablename__ = "opportunity_scores"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), unique=True, nullable=False)
    total_score = Column(Integer, nullable=False, index=True) # 0-100
    website_deficit = Column(Integer, nullable=False) # 0-35
    commercial_viability = Column(Integer, nullable=False) # 0-30
    contact_access = Column(Integer, nullable=False) # 0-20
    agency_fit = Column(Integer, nullable=False) # 0-15
    deficit_reason = Column(Text, nullable=True)
    viability_reason = Column(Text, nullable=True)
    contact_reason = Column(Text, nullable=True)
    fit_reason = Column(Text, nullable=True)
    calculated_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="score")


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), unique=True, nullable=False)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(50), nullable=True)
    verification_status = Column(String(50), default="UNAVAILABLE") # VERIFIED_DELIVERABLE, ACCEPT_ALL_UNVERIFIED, NO_MX_RECORDS, UNAVAILABLE
    primary_mx_host = Column(String(255), nullable=True)
    source_url = Column(Text, nullable=True)
    confidence_score = Column(Float, default=0.5)
    updated_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="contact")


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), unique=True, nullable=False)
    business_summary = Column(Text, nullable=False)
    identified_niche = Column(String(100), nullable=True)
    qualification_status = Column(String(50), default="QUALIFIED")
    qualification_reason = Column(Text, nullable=True)
    digital_vulnerabilities_json = Column(Text, default="[]")
    suggested_features_json = Column(Text, default="[]")
    agency_value_proposition = Column(Text, nullable=False)
    tokens_used = Column(Integer, default=0)
    estimated_cost_usd = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="ai_analysis")


class EmailDraft(Base):
    __tablename__ = "email_drafts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False)
    angle = Column(String(50), default="GROWTH_MISSED_REVENUE")
    subject_lines_json = Column(Text, nullable=False)
    selected_subject = Column(Text, nullable=False)
    body_markdown = Column(Text, nullable=False)
    model_used = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="email_drafts")


class SearchHistory(Base):
    __tablename__ = "search_histories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    query_city = Column(String(100), nullable=False)
    query_category = Column(String(100), nullable=False)
    radius_km = Column(Float, default=10.0)
    source = Column(String(50), default="OPENSTREETMAP")
    total_found = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class APIUsageLog(Base):
    __tablename__ = "api_usage_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    provider = Column(String(50), nullable=False) # OPENROUTER, PAGESPEED, OVERPASS
    endpoint = Column(String(255), nullable=False)
    tokens_in = Column(Integer, default=0)
    tokens_out = Column(Integer, default=0)
    cost_usd = Column(Float, default=0.0)
    duration_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
