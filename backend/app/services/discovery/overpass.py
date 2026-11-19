import httpx
import logging
from typing import List, Dict, Any, Optional
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

CITY_COORDINATES = {
    "mumbai": (19.0760, 72.8777),
    "pune": (18.5204, 73.8567),
    "delhi ncr": (28.6139, 77.2090),
    "delhi": (28.6139, 77.2090),
    "bengaluru": (12.9716, 77.5946),
    "bangalore": (12.9716, 77.5946),
    "goa": (15.4989, 73.8278),
    "hyderabad": (17.3850, 78.4867),
    "chennai": (13.0827, 80.2707),
    "ahmedabad": (23.0225, 72.5714),
    "kolkata": (22.5726, 88.3639),
    "jaipur": (26.9124, 75.7873),
    "chandigarh": (30.7333, 76.7794),
}

CATEGORY_TAGS = {
    "all businesses & shops": '["shop"]',
    "all categories": '["shop"]',
    "retail shops & stores": '["shop"~"convenience|clothes|supermarket|boutique|electronics|shoes|books|jewelry|hardware|bakery|department_store"]',
    "salons & spas": '["shop"~"beauty|hairdresser|spa|massage"]',
    "automobile & repair": '["shop"~"car|car_repair|car_parts|motorcycle"]',
    "bakeries & food": '["shop"~"bakery|pastry|confectionery|deli"]',
    "clinics & healthcare": '["amenity"~"clinic|hospital|dentist|doctors|pharmacy"]',
    "restaurants & cafes": '["amenity"~"restaurant|cafe|fast_food|bar|pub"]',
    "hotels & resorts": '["tourism"~"hotel|resort|guest_house"]',
    "gyms & fitness": '["leisure"~"fitness_centre|sports_centre"]',
    "coaching & academies": '["amenity"~"college|school|language_school|training"]',
}

class OverpassDiscoveryService:
    OVERPASS_URLS = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
    ]

    @classmethod
    async def discover_businesses(cls, city: str, category: str, radius_km: float = 10.0, latitude: Optional[float] = None, longitude: Optional[float] = None) -> List[Dict[str, Any]]:
        if latitude is not None and longitude is not None:
            lat, lng = latitude, longitude
            city_display = "Current Location"
        else:
            city_lower = city.lower().strip()
            coords = CITY_COORDINATES.get(city_lower, (19.0760, 72.8777))
            lat, lng = coords
            city_display = city

        radius_meters = int(radius_km * 1000)

        cat_lower = category.lower().strip()
        if cat_lower in ("all", "all categories", "all businesses & shops", "all local businesses", ""):
            tag_filter = '["shop"]'
        else:
            tag_filter = CATEGORY_TAGS.get(cat_lower, '["shop"]')

        # Overpass QL query: find nodes around lat/lng with specified tags and having a name
        query = f"""
        [out:json][timeout:25];
        (
          node{tag_filter}["name"](around:{radius_meters},{lat},{lng});
          way{tag_filter}["name"](around:{radius_meters},{lat},{lng});
        );
        out center 25;
        """

        headers = {
            "User-Agent": settings.CRAWLER_USER_AGENT
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            for endpoint in cls.OVERPASS_URLS:
                try:
                    response = await client.post(endpoint, data={"data": query}, headers=headers)
                    if response.status_code == 200:
                        data = response.json()
                        elements = data.get("elements", [])
                        return cls._parse_elements(elements, city_display, category)
                except Exception as e:
                    logger.warning(f"Overpass query failed on {endpoint}: {e}")
                    continue

        return []

    @classmethod
    def _parse_elements(cls, elements: List[Dict[str, Any]], city: str, category: str) -> List[Dict[str, Any]]:
        results = []
        for el in elements:
            tags = el.get("tags", {})
            name = tags.get("name")
            if not name:
                continue

            lat = el.get("lat") or el.get("center", {}).get("lat")
            lng = el.get("lon") or el.get("center", {}).get("lon")
            if not lat or not lng:
                continue

            phone = tags.get("phone") or tags.get("contact:phone") or tags.get("mobile")
            website = tags.get("website") or tags.get("contact:website") or tags.get("url")
            locality = tags.get("addr:suburb") or tags.get("addr:street") or tags.get("addr:district") or "Central"

            shop_tag = tags.get("shop")
            amenity_tag = tags.get("amenity")
            derived_cat = category
            if shop_tag and shop_tag != "yes":
                derived_cat = shop_tag.replace("_", " ").title()
            elif amenity_tag:
                derived_cat = amenity_tag.replace("_", " ").title()
            elif category.lower() in ("all", "all categories", "all businesses & shops"):
                derived_cat = "Retail / Shop"

            results.append({
                "name": name,
                "category": derived_cat,
                "city": city.title(),
                "locality": locality,
                "latitude": float(lat),
                "longitude": float(lng),
                "phone": phone,
                "website": website,
                "osm_id": el.get("id"),
            })

        return results
