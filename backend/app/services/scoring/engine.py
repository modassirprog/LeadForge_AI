from typing import Dict, Any

HIGH_TICKET_CATEGORIES = {
    "clinics & healthcare", "hotels & resorts", "clinics & hospitals",
    "coaching & academies", "real estate agencies"
}

MID_TICKET_CATEGORIES = {
    "restaurants & cafes", "gyms & fitness", "salons & spas", "local retailers"
}

class OpportunityScoringEngine:
    @classmethod
    def calculate_opportunity_score(
        cls,
        category: str,
        website_status: str,
        is_mobile_responsive: bool,
        performance_score: int,
        has_ssl: bool,
        star_rating: float,
        review_count: int,
        has_phone: bool,
        has_email: bool,
        is_email_verified: bool
    ) -> Dict[str, Any]:
        """
        Calculates an explainable 0–100 Opportunity Score separating
        business financial viability from digital website weakness.
        """
        # 1. Website Deficit Score (0–35)
        deficit_score = 0
        deficit_reason = ""

        if website_status == "NO_WEBSITE":
            deficit_score = 35
            deficit_reason = "No website found; relying exclusively on directory listings."
        elif website_status == "SOCIAL_ONLY":
            deficit_score = 30
            deficit_reason = "Uses a social media profile link as their website; missing direct conversion funnels."
        elif website_status == "BROKEN_OR_INACTIVE":
            deficit_score = 28
            deficit_reason = "Listed website is offline, broken, or unreachable."
        elif not is_mobile_responsive or performance_score < 40:
            deficit_score = 22
            deficit_reason = f"Website fails mobile usability standards with low speed index ({performance_score}/100)."
        elif not has_ssl:
            deficit_score = 15
            deficit_reason = "Website lacks SSL HTTPS security; Chrome marks it as Not Secure."
        else:
            deficit_score = 5
            deficit_reason = "Website is active and responsive; lower development urgency."

        # 2. Commercial Viability Score (0–30)
        viability_score = 0
        if review_count >= 100:
            viability_score += 15
        elif review_count >= 50:
            viability_score += 10
        elif review_count >= 10:
            viability_score += 5
        else:
            viability_score += 2

        if star_rating >= 4.0:
            viability_score += 10
        elif star_rating >= 3.5:
            viability_score += 5

        if has_phone:
            viability_score += 5

        viability_reason = f"Active local footprint with {review_count} reviews and {star_rating}★ customer rating."

        # 3. Contact Accessibility Score (0–20)
        contact_score = 0
        if is_email_verified:
            contact_score += 15
            contact_reason = "Verified deliverable mailbox confirmed via DNS MX records."
        elif has_email:
            contact_score += 10
            contact_reason = "Public email found; unverified mail server."
        else:
            contact_reason = "No email listed; phone outreach required."

        if has_phone:
            contact_score += 5

        contact_score = min(contact_score, 20)

        # 4. Agency Service Fit (0–15)
        cat_lower = category.lower().strip()
        if any(h in cat_lower for h in HIGH_TICKET_CATEGORIES):
            fit_score = 15
            fit_reason = "High-ticket vertical with proven ROI on digital booking & lead systems."
        elif any(m in cat_lower for m in MID_TICKET_CATEGORIES):
            fit_score = 10
            fit_reason = "Mid-ticket local commercial establishment with recurring footfall."
        else:
            fit_score = 5
            fit_reason = "Standard local service provider."

        total = deficit_score + viability_score + contact_score + fit_score
        total = max(0, min(100, total))

        return {
            "total_score": total,
            "website_deficit": deficit_score,
            "commercial_viability": viability_score,
            "contact_access": contact_score,
            "agency_fit": fit_score,
            "deficit_reason": deficit_reason,
            "viability_reason": viability_reason,
            "contact_reason": contact_reason,
            "fit_reason": fit_reason
        }
