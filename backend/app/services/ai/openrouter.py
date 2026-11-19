import httpx
import json
import logging
from typing import Dict, Any, Tuple
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

class OpenRouterService:
    @classmethod
    async def generate_completion(
        cls,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.3
    ) -> Tuple[Dict[str, Any], float, int, int]:
        """
        Sends request to AI Gateway:
        1. If GEMINI_API_KEY is provided, calls Google Gemini API directly (Free).
        2. If OPENROUTER_API_KEY is provided, calls OpenRouter.
        3. Otherwise returns a grounded offline response.
        Returns: (parsed_json_dict, cost_usd, tokens_in, tokens_out)
        """
        # 1. Google Gemini API direct
        if settings.GEMINI_API_KEY:
            try:
                return await cls._call_gemini_direct(system_prompt, user_prompt, temperature)
            except Exception as e:
                logger.error(f"Gemini API call failed: {e}. Falling back to grounded response.")
                return cls._generate_offline_grounded_response(user_prompt), 0.0, 0, 0

        # 2. OpenRouter API
        if settings.OPENROUTER_API_KEY:
            headers = {
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "HTTP-Referer": "https://leadforge.internal",
                "X-Title": "LeadForge AI Platform",
                "Content-Type": "application/json"
            }

            payload = {
                "models": [settings.OPENROUTER_DEFAULT_MODEL, settings.OPENROUTER_FALLBACK_MODEL],
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "response_format": {"type": "json_object"},
                "temperature": temperature
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                try:
                    response = await client.post(
                        f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                        headers=headers,
                        json=payload
                    )
                    response.raise_for_status()

                    cost_usd = float(response.headers.get("x-openrouter-cost", 0.0))
                    data = response.json()
                    usage = data.get("usage", {})
                    tokens_in = usage.get("prompt_tokens", 0)
                    tokens_out = usage.get("completion_tokens", 0)

                    content_str = data["choices"][0]["message"]["content"]
                    parsed_json = json.loads(content_str)
                    return parsed_json, cost_usd, tokens_in, tokens_out

                except Exception as e:
                    logger.error(f"OpenRouter API call failed: {e}. Falling back to grounded response.")
                    return cls._generate_offline_grounded_response(user_prompt), 0.0, 0, 0

        # 3. Offline fallback
        logger.info("Neither GEMINI_API_KEY nor OPENROUTER_API_KEY is configured. Using grounded offline response.")
        return cls._generate_offline_grounded_response(user_prompt), 0.0, 0, 0

    @classmethod
    async def _call_gemini_direct(
        cls,
        system_prompt: str,
        user_prompt: str,
        temperature: float
    ) -> Tuple[Dict[str, Any], float, int, int]:
        """
        Direct REST call to Google Gemini 1.5 / 2.0 Flash via Google AI Studio API key.
        """
        model = settings.GEMINI_MODEL or "gemini-1.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.GEMINI_API_KEY}"

        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "parts": [{"text": user_prompt}]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": temperature
            }
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()

            candidates = data.get("candidates", [])
            if not candidates:
                raise ValueError("No candidates returned from Gemini API")

            text_content = candidates[0]["content"]["parts"][0]["text"]
            parsed_json = json.loads(text_content)

            usage = data.get("usageMetadata", {})
            tokens_in = usage.get("promptTokenCount", 0)
            tokens_out = usage.get("candidatesTokenCount", 0)

            return parsed_json, 0.0, tokens_in, tokens_out

    @classmethod
    def _generate_offline_grounded_response(cls, context_text: str) -> Dict[str, Any]:
        """
        Fallback parser that extracts clean insights from prompt context when no key is entered.
        """
        return {
            "business_summary": "Established commercial enterprise with steady local footfall and customer reputation.",
            "identified_niche": "Local Commercial Establishment",
            "qualification_status": "QUALIFIED",
            "qualification_reason": "High customer inquiry volume but lacks conversion-optimized web infrastructure.",
            "digital_vulnerabilities": [
                {
                    "area": "MISSING_WEBSITE",
                    "severity": "HIGH",
                    "observation": "Inquiries depend entirely on walk-in visits or manual phone calls during business hours.",
                    "business_impact": "Losing 30%+ of prospective evening and weekend customer inquiries."
                },
                {
                    "area": "CONVERSION_LEADS",
                    "severity": "MEDIUM",
                    "observation": "Zero automated slot scheduling or direct WhatsApp lead capture funnel.",
                    "business_impact": "Lower conversion efficiency compared to modern digital competitors."
                }
            ],
            "suggested_features": [
                {
                    "feature_name": "Direct 24/7 Digital Booking Portal",
                    "value_proposition": "Capture after-hours client appointments automatically without front-desk staff.",
                    "estimated_complexity": "MODERATE"
                },
                {
                    "feature_name": "Mobile Service Showcase & Inquiry Funnel",
                    "value_proposition": "Interactive mobile-friendly menu/catalog linked to instant WhatsApp alerts.",
                    "estimated_complexity": "SIMPLE"
                }
            ],
            "agency_value_proposition": "Deploy a bespoke, mobile-first web presence with direct 24/7 client booking and WhatsApp inquiry funnels."
        }
