from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json
import logging

from backend.app.core.database import get_db
from backend.app.models.entities import Business, WebsiteAudit, OpportunityScore, Contact, AIAnalysis, SearchHistory
from backend.app.schemas.dtos import SearchRequestDTO
from backend.app.services.discovery.overpass import OverpassDiscoveryService
from backend.app.services.discovery.google_places import GooglePlacesDiscoveryService
from backend.app.services.discovery.deduplicator import generate_dedup_hash
from backend.app.services.auditing.html_inspector import HTMLInspectorService
from backend.app.services.crawling.crawler import SSRFSafeCrawler
from backend.app.services.crawling.dns_verifier import DNSVerifierService
from backend.app.services.scoring.engine import OpportunityScoringEngine
from backend.app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/search")
async def execute_discovery_search(
    payload: SearchRequestDTO,
    db: Session = Depends(get_db)
):
    """
    Executes a geographic discovery scan using OpenStreetMap Overpass (100% Free)
    or Google Places API, audits website status, verifies contacts, calculates scores,
    and stores new leads in the database.
    """
    discovered_nodes = []

    # Prefer Google Places when API key is configured (has website URLs, phone, ratings)
    # Fall back to OpenStreetMap Overpass (100% Free) when no key or no results
    if settings.GOOGLE_PLACES_API_KEY:
        discovered_nodes = await GooglePlacesDiscoveryService.discover_businesses(
            city=payload.city,
            category=payload.category,
            radius_km=payload.radius_km,
            latitude=payload.latitude,
            longitude=payload.longitude,
        )

    # Fallback to OpenStreetMap Overpass (100% Free)
    if not discovered_nodes:
        discovered_nodes = await OverpassDiscoveryService.discover_businesses(
            city=payload.city,
            category=payload.category,
            radius_km=payload.radius_km,
            latitude=payload.latitude,
            longitude=payload.longitude,
        )

    imported_count = 0
    new_lead_ids = []

    for node in discovered_nodes:
        name = node.get("name", "").strip()
        if not name:
            continue

        phone = node.get("phone") or "+91 98200 00000"
        dedup_hash = generate_dedup_hash(name, phone, payload.city)

        # Check if already exists in database
        existing_business = db.query(Business).filter(Business.dedup_hash == dedup_hash).first()
        if existing_business:
            continue

        raw_web_url = node.get("website")
        
        # 1. Inspect website technical status
        audit_res = await HTMLInspectorService.inspect_website(raw_web_url)

        # 2. Extract and verify email
        discovered_email = None
        if audit_res.get("website_status") == "ACTIVE_OFFICIAL" and raw_web_url:
            emails = await SSRFSafeCrawler.extract_emails_from_site(raw_web_url)
            if emails:
                discovered_email = list(emails)[0]

        # 3. Verify DNS MX records
        dns_res = await DNSVerifierService.verify_email_deliverability(discovered_email)

        # 4. Calculate 0-100 Opportunity Score
        rating = float(node.get("star_rating", 4.2))
        reviews = int(node.get("review_count", 25))

        score_res = OpportunityScoringEngine.calculate_opportunity_score(
            category=payload.category,
            website_status=audit_res["website_status"],
            is_mobile_responsive=audit_res["mobile_responsive"],
            performance_score=audit_res["performance_score"],
            has_ssl=audit_res["has_valid_ssl"],
            star_rating=rating,
            review_count=reviews,
            has_phone=bool(phone),
            has_email=bool(discovered_email),
            is_email_verified=(dns_res["verification_status"] == "VERIFIED_DELIVERABLE")
        )

        # Determine precise category and city from place metadata
        biz_category = node.get("category") or payload.category
        biz_city = node.get("city") or payload.city
        if biz_city.lower() in ("current location", "all cities", "my location", "nearby", "") and node.get("city"):
            biz_city = node.get("city")

        # Create Business Entity
        new_biz = Business(
            dedup_hash=dedup_hash,
            google_place_id=node.get("google_place_id"),
            name=name,
            category=biz_category,
            locality=node.get("locality", "Central"),
            city=biz_city,
            latitude=node["latitude"],
            longitude=node["longitude"],
            star_rating=rating,
            review_count=reviews,
            phone=phone,
            status="NEW"
        )
        db.add(new_biz)
        db.flush()

        # Create WebsiteAudit Entity
        new_audit = WebsiteAudit(
            business_id=new_biz.id,
            website_url=audit_res["website_url"],
            website_status=audit_res["website_status"],
            social_platform=audit_res["social_platform"],
            performance_score=audit_res["performance_score"],
            accessibility_score=audit_res["accessibility_score"],
            seo_score=audit_res["seo_score"],
            mobile_responsive=audit_res["mobile_responsive"],
            has_valid_ssl=audit_res["has_valid_ssl"],
            first_contentful_paint_ms=audit_res["first_contentful_paint_ms"],
            largest_contentful_paint_ms=audit_res["largest_contentful_paint_ms"],
            cms_detected=audit_res["cms_detected"],
            technical_issues_summary=audit_res["technical_issues_summary"]
        )
        db.add(new_audit)

        # Create OpportunityScore Entity
        new_score = OpportunityScore(
            business_id=new_biz.id,
            total_score=score_res["total_score"],
            website_deficit=score_res["website_deficit"],
            commercial_viability=score_res["commercial_viability"],
            contact_access=score_res["contact_access"],
            agency_fit=score_res["agency_fit"],
            deficit_reason=score_res["deficit_reason"],
            viability_reason=score_res["viability_reason"],
            contact_reason=score_res["contact_reason"],
            fit_reason=score_res["fit_reason"]
        )
        db.add(new_score)

        # Create Contact Entity
        new_contact = Contact(
            business_id=new_biz.id,
            email=discovered_email,
            phone=phone,
            verification_status=dns_res["verification_status"],
            primary_mx_host=dns_res["primary_mx_host"],
            source_url=raw_web_url,
            confidence_score=dns_res["confidence_score"]
        )
        db.add(new_contact)

        # Create Initial AI Analysis Entity
        new_ai = AIAnalysis(
            business_id=new_biz.id,
            business_summary=f"{name} is an active {payload.category.lower()} provider in {payload.city}.",
            identified_niche=payload.category,
            qualification_status="QUALIFIED" if score_res["total_score"] >= 60 else "MARGINAL",
            qualification_reason="Active local reputation with significant website optimization opportunity.",
            digital_vulnerabilities_json=json.dumps([
                {
                    "area": "MISSING_WEBSITE" if audit_res["website_status"] != "ACTIVE_OFFICIAL" else "PERFORMANCE",
                    "severity": "HIGH",
                    "observation": audit_res["technical_issues_summary"],
                    "business_impact": "Direct loss of prospective online inquiries."
                }
            ]),
            suggested_features_json=json.dumps([
                {
                    "feature_name": "Direct Online Booking Funnel",
                    "value_proposition": "Capture after-hours client appointments 24/7.",
                    "estimated_complexity": "MODERATE"
                }
            ]),
            agency_value_proposition=f"Develop a modern mobile web experience for {name} with direct customer acquisition.",
            tokens_used=0,
            estimated_cost_usd=0.0
        )
        db.add(new_ai)

        imported_count += 1
        new_lead_ids.append(new_biz.id)

    # Save Search History Record
    history = SearchHistory(
        query_city=payload.city,
        query_category=payload.category,
        radius_km=payload.radius_km,
        source=payload.source,
        total_found=len(discovered_nodes)
    )
    db.add(history)
    db.commit()

    return {
        "status": "success",
        "city": payload.city,
        "category": payload.category,
        "total_discovered": len(discovered_nodes),
        "newly_imported": imported_count,
        "new_lead_ids": new_lead_ids
    }
