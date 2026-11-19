import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class PageSpeedAuditorService:
    PAGESPEED_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"

    @classmethod
    async def audit_url(cls, url: str) -> Optional[Dict[str, Any]]:
        """
        Calls Google PageSpeed Insights API (Free Google API, 25k requests/day).
        """
        if not url or not url.startswith("http"):
            return None

        params = {
            "url": url,
            "strategy": "mobile",
            "category": ["performance", "seo", "accessibility"]
        }

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                response = await client.get(cls.PAGESPEED_URL, params=params)
                if response.status_code == 200:
                    data = response.json()
                    lighthouse = data.get("lighthouseResult", {})
                    categories = lighthouse.get("categories", {})
                    audits = lighthouse.get("audits", {})

                    perf_score = int((categories.get("performance", {}).get("score") or 0) * 100)
                    acc_score = int((categories.get("accessibility", {}).get("score") or 0) * 100)
                    seo_score = int((categories.get("seo", {}).get("score") or 0) * 100)

                    fcp = int(audits.get("first-contentful-paint", {}).get("numericValue", 0))
                    lcp = int(audits.get("largest-contentful-paint", {}).get("numericValue", 0))

                    return {
                        "performance_score": perf_score,
                        "accessibility_score": acc_score,
                        "seo_score": seo_score,
                        "first_contentful_paint_ms": fcp,
                        "largest_contentful_paint_ms": lcp,
                    }
        except Exception as e:
            logger.warning(f"PageSpeed audit failed for {url}: {e}")

        return None
