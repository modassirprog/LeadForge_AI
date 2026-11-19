import dns.asyncresolver
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

DISPOSABLE_DOMAINS = {
    "mailinator.com", "guerrillamail.com", "tempmail.com", "10minutemail.com",
    "sharklasers.com", "yopmail.com", "trashmail.com"
}

class DNSVerifierService:
    @classmethod
    async def verify_email_deliverability(cls, email: Optional[str]) -> Dict[str, Any]:
        """
        In-House Zero-Cost Verification:
        1. Checks syntax
        2. Detects disposable domains
        3. Queries DNS MX records directly to confirm active mail delivery server
        """
        if not email or "@" not in email:
            return {
                "verification_status": "UNAVAILABLE",
                "primary_mx_host": None,
                "confidence_score": 0.0
            }

        domain = email.split("@")[-1].lower().strip()

        if domain in DISPOSABLE_DOMAINS:
            return {
                "verification_status": "NO_MX_RECORDS",
                "primary_mx_host": None,
                "confidence_score": 0.1
            }

        try:
            resolver = dns.asyncresolver.Resolver()
            resolver.timeout = 5.0
            resolver.lifetime = 5.0

            answers = await resolver.resolve(domain, "MX")
            if answers and len(answers) > 0:
                # Sort by MX preference
                sorted_mx = sorted(answers, key=lambda r: r.preference)
                primary_mx = str(sorted_mx[0].exchange).rstrip(".").lower()

                # Detect known providers for nice labels
                display_mx = primary_mx
                if "google" in primary_mx or "aspmx" in primary_mx:
                    display_mx = f"Google Workspace ({primary_mx})"
                elif "outlook" in primary_mx or "microsoft" in primary_mx:
                    display_mx = f"Microsoft 365 ({primary_mx})"
                elif "zoho" in primary_mx:
                    display_mx = f"Zoho Mail ({primary_mx})"

                return {
                    "verification_status": "VERIFIED_DELIVERABLE",
                    "primary_mx_host": display_mx,
                    "confidence_score": 0.95
                }
            else:
                return {
                    "verification_status": "NO_MX_RECORDS",
                    "primary_mx_host": None,
                    "confidence_score": 0.2
                }

        except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
            return {
                "verification_status": "NO_MX_RECORDS",
                "primary_mx_host": None,
                "confidence_score": 0.1
            }
        except Exception as e:
            logger.warning(f"DNS MX lookup error for {domain}: {e}")
            return {
                "verification_status": "ACCEPT_ALL_UNVERIFIED",
                "primary_mx_host": "DNS Lookup Timeout",
                "confidence_score": 0.5
            }
