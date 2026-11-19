import httpx
import logging
from typing import List, Dict, Any, Optional
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

SEARCH_TEXT_URL = "https://places.googleapis.com/v1/places:searchText"
SEARCH_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"

FIELD_MASK = (
    "places.id,places.displayName,places.formattedAddress,"
    "places.websiteUri,places.nationalPhoneNumber,places.rating,"
    "places.userRatingCount,places.location,places.primaryTypeDisplayName"
)

class GooglePlacesDiscoveryService:
    @classmethod
    async def discover_businesses(
        cls,
        city: str,
        category: str,
        radius_km: float = 10.0,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
    ) -> List[Dict[str, Any]]:
        if not settings.GOOGLE_PLACES_API_KEY:
            logger.info("GOOGLE_PLACES_API_KEY not configured; skipping Google Places discovery.")
            return []

        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": settings.GOOGLE_PLACES_API_KEY,
            "X-Goog-FieldMask": FIELD_MASK,
        }

        # Determine search term: if generic or 'all categories', search for local shops and businesses
        is_all_cat = category.lower().strip() in (
            "all", "all categories", "all businesses & shops", "all businesses", "all local businesses", ""
        )
        search_cat = "local shops, stores, and businesses" if is_all_cat else category

        # Use Text Search with locationBias when coordinates are available,
        # otherwise standard Text Search by query and city.
        if latitude is not None and longitude is not None:
            query_text = search_cat if city.lower() in ("current location", "all cities", "my location", "") else f"{search_cat} in {city}"
            payload = {
                "textQuery": query_text,
                "locationBias": {
                    "circle": {
                        "center": {"latitude": latitude, "longitude": longitude},
                        "radius": float(radius_km * 1000),
                    }
                },
                "pageSize": 20,
            }
            url = SEARCH_TEXT_URL
            city_display = city if city.lower() not in ("current location", "all cities", "my location") else "Nearby"
        else:
            payload = {
                "textQuery": f"{search_cat} in {city}",
                "pageSize": 20,
            }
            url = SEARCH_TEXT_URL
            city_display = city

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    places = data.get("places", [])
                    return cls._parse_places(places, city_display, category)
                else:
                    logger.warning(f"Google Places API responded with status {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Error querying Google Places API: {e}")

        return []

    @classmethod
    def _parse_places(cls, places: List[Dict[str, Any]], city: str, category: str) -> List[Dict[str, Any]]:
        results = []
        for p in places:
            display_name = p.get("displayName", {}).get("text", "")
            if not display_name:
                continue

            addr = p.get("formattedAddress", "")
            derived_city = city
            derived_locality = "Central"

            if addr:
                parts = [part.strip() for part in addr.split(",") if part.strip()]
                if len(parts) >= 2:
                    derived_locality = parts[0]
                    # If city was generic, pick the second or third last part (usually city)
                    if city.lower() in ("nearby", "current location", "all cities", ""):
                        # e.g., ["Shop 1", "Main Road", "Indiranagar", "Bengaluru", "Karnataka 560038", "India"]
                        if len(parts) >= 3:
                            derived_city = parts[-3] if len(parts) >= 4 else parts[-2]
                        else:
                            derived_city = parts[1]
                elif len(parts) == 1:
                    derived_locality = parts[0]

            primary_type = p.get("primaryTypeDisplayName", {}).get("text")
            display_category = primary_type if primary_type else (
                category if category.lower() not in ("all", "all categories", "all businesses & shops") else "Local Business"
            )

            loc = p.get("location", {})
            results.append({
                "google_place_id": p.get("id"),
                "name": display_name,
                "category": display_category,
                "city": derived_city.title(),
                "locality": derived_locality,
                "latitude": loc.get("latitude", 19.0760),
                "longitude": loc.get("longitude", 72.8777),
                "star_rating": float(p.get("rating", 4.0)),
                "review_count": int(p.get("userRatingCount", 0)),
                "phone": p.get("nationalPhoneNumber"),
                "website": p.get("websiteUri")
            })

        return results
