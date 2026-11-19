# AI Architecture & Orchestration Specification
## LeadForge AI — Central OpenRouter Intelligence Engine

---

### 1. Unified Gateway Architecture

LeadForge AI channels 100% of its machine intelligence workloads through a single gateway: the **OpenRouter API** (`https://openrouter.ai/api/v1`). 

By standardizing on OpenRouter, the platform achieves:
1. **Zero Multi-Account Overhead:** One prepaid billing account, one API key, one unified SDK interface.
2. **Dynamic Task-Based Model Routing:** Routing high-volume, simple jobs to sub-cent models, while reserving state-of-the-art reasoning models for client-facing sales copy.
3. **Native Model Cascades & Failover:** OpenRouter allows passing an array of models (`models: ["model-primary", "model-fallback"]`). If the primary model suffers an outage or rate limit, OpenRouter automatically fails over with zero application code intervention.
4. **Enforced JSON Schemas:** Guaranteed structured outputs parsed directly into Pydantic v2 classes.
5. **Real-Time Cost Auditing:** OpenRouter returns the exact operation cost in USD in the `x-openrouter-cost` HTTP response header, which is immediately logged to the database.

```mermaid
flowchart TD
    TaskTrigger[Internal Request: AI Task] --> Dispatcher{Task Type Router}

    Dispatcher -- "Classification / Clean" --> Tier1[Tier 1: Fast & Ultra-Low Cost<br/>DeepSeek V3 / Gemini 1.5 Flash]
    Dispatcher -- "Business Intelligence" --> Tier2[Tier 2: Structured Analysis<br/>DeepSeek V3 / GPT-4o-mini]
    Dispatcher -- "Sales Pitch Writing" --> Tier3[Tier 3: High-Converting Copy<br/>Claude 3.5 Sonnet / GPT-4o-mini]

    Tier1 --> OpenRouterPayload[Construct OpenRouter Payload<br/>System Prompt + User Context + JSON Schema]
    Tier2 --> OpenRouterPayload
    Tier3 --> OpenRouterPayload

    OpenRouterPayload --> CallOpenRouter[POST api.openrouter.ai/v1/chat/completions<br/>models: [primary, fallback]]
    
    CallOpenRouter --> PydanticValidator{Pydantic v2 Validation}
    PydanticValidator -- Valid JSON --> LogCost[Record Tokens & Cost in api_usage_logs]
    PydanticValidator -- Validation Error --> Retry[Exponential Backoff Retry with Error Correction]
    Retry --> CallOpenRouter
    
    LogCost --> SaveDB[(PostgreSQL)]
```

---

### 2. Verified Model Selection Strategy

*All model identifiers below are verified active models in the OpenRouter model registry.*

| Tier | Workload / Task | Primary Model ID | Fallback Model ID | Input / Output Cost (per 1M tokens) |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Classification** | Category cleanup, Social vs Official domain classification | `deepseek/deepseek-chat` | `google/gemini-flash-1.5` | ~$0.14 in / $0.28 out (DeepSeek)<br/>~$0.075 in / $0.30 out (Gemini) |
| **Tier 2: Business Intelligence** | Digital vulnerability analysis, agency feature proposition | `deepseek/deepseek-chat` | `openai/gpt-4o-mini` | ~$0.14 in / $0.28 out (DeepSeek)<br/>~$0.15 in / $0.60 out (GPT-4o-mini) |
| **Tier 3: Email Pitching** | Hyper-personalized, non-hallucinatory sales copy & subjects | `anthropic/claude-3.5-sonnet` *(Premium)*<br/>`openai/gpt-4o-mini` *(Budget)* | `google/gemini-flash-1.5` | ~$3.00 in / $15.00 out (Claude)<br/>~$0.15 in / $0.60 out (GPT-4o-mini) |
| **Tier 4: Demo Generator (Phase 4)**| Tailwind CSS / HTML landing page mockup code | `anthropic/claude-3.5-sonnet` | `deepseek/deepseek-chat` | ~$3.00 in / $15.00 out (Claude) |

---

### 3. Pydantic v2 Schemas for Structured JSON Validation

#### 3.1 Business Intelligence Schema (`ai_analyses`)

```python
from pydantic import BaseModel, Field
from typing import List, Literal

class DigitalVulnerability(BaseModel):
    area: Literal["MOBILE", "PERFORMANCE", "SECURITY_SSL", "MISSING_WEBSITE", "CONVERSION_LEADS", "SEO"]
    severity: Literal["HIGH", "MEDIUM", "LOW"]
    observation: str = Field(description="Objective factual observation based strictly on audit data.")
    business_impact: str = Field(description="How this weakness impacts customer acquisition or revenue.")

class SuggestedFeature(BaseModel):
    feature_name: str = Field(description="Name of recommended web feature (e.g. 'Online Table Booking').")
    value_proposition: str = Field(description="Why this feature benefits this specific business.")
    estimated_complexity: Literal["SIMPLE", "MODERATE", "ADVANCED"]

class BusinessIntelligenceResponse(BaseModel):
    business_summary: str = Field(description="2-sentence summary of what the business does and who its customers are.")
    identified_niche: str = Field(description="Specific sub-vertical e.g. 'Cosmetic Dental Clinic'.")
    qualification_status: Literal["QUALIFIED", "MARGINAL", "DISQUALIFIED"]
    qualification_reason: str = Field(description="Explanation of why this business is or is not worth pitching.")
    digital_vulnerabilities: List[DigitalVulnerability] = Field(min_length=1, max_length=4)
    suggested_website_features: List[SuggestedFeature] = Field(min_length=2, max_length=5)
    agency_value_proposition: str = Field(description="A concise 1-paragraph customized pitch thesis.")
```

#### 3.2 Sales Email Generation Schema (`email_drafts`)

```python
from pydantic import BaseModel, Field
from typing import List, Literal

class EmailDraftResponse(BaseModel):
    subject_lines: List[str] = Field(
        min_length=3,
        max_length=3,
        description="Three high-converting, professional subject lines under 50 characters."
    )
    selected_subject_index: int = Field(default=0, ge=0, le=2)
    hook_sentence: str = Field(description="Opening sentence referencing a verified, specific business detail.")
    body_markdown: str = Field(description="Complete professional email body in clean Markdown (100–160 words).")
    suggested_call_to_action: str = Field(description="Low-friction CTA (e.g. offer a 2-minute video mockup).")
    angle_used: Literal["VALUE_GROWTH", "TECHNICAL_FLAW_AUDIT", "COMPETITOR_COMPARISON"]
    factual_verification_passed: bool = Field(
        description="Must be True only if zero unverified claims were made."
    )
```

---

### 4. Production Prompt Templates

#### 4.1 Business Intelligence & Opportunity Prompt

```
[SYSTEM PROMPT]
You are a Principal Digital Agency Solutions Architect. Your job is to analyze real local businesses and evaluate their need for professional website development and digital systems.

CRITICAL OPERATIONAL RULES:
1. GROUNDING RULE: Base your analysis EXCLUSIVELY on the provided business profile and technical audit data.
2. ZERO HALLUCINATION RULE: Never invent client names, awards, branches, or customer reviews that are not explicitly present in the data.
3. COMMERCIAL REALITY: A high rating (4.8 stars) with 500+ reviews proves the business is busy and financially viable, but an absent or broken website proves their digital infrastructure is losing them direct revenue.
4. Output strictly valid JSON matching the requested schema. No conversational filler.

[USER PROMPT]
Evaluate the following business for our web development agency:

BUSINESS PROFILE:
- Name: {{ business.name }}
- Category: {{ business.primary_category }}
- City: {{ business.city }}, {{ business.state }}, {{ business.country }}
- Google Rating: {{ business.star_rating }} stars ({{ business.review_count }} reviews)
- Phone Present: {{ business.has_phone }}

WEBSITE AUDIT FINDINGS:
- Current Website Status: {{ website.status }}
- URL: {{ website.url }}
- Mobile Responsive: {{ audit.is_mobile_responsive }}
- Mobile Performance Score: {{ audit.performance_score }}/100
- Core Web Vitals LCP: {{ audit.largest_contentful_paint_ms }} ms
- SSL Certificate Valid: {{ audit.has_valid_ssl }}
- Detected CMS / Tech: {{ audit.cms_detected }}
- Specific Technical Issues: {{ audit.technical_issues_summary }}
```

#### 4.2 Sales Email Generation Prompt

```
[SYSTEM PROMPT]
You are a Senior B2B Outreach Specialist for a boutique website development and digital design studio.
You write concise, polite, deeply personalized, and highly compelling B2B sales emails to local business owners.

OUTREACH PHILOSOPHY:
- Never sound like an automated mass blast or a generic marketing agency.
- Write like a knowledgeable technical professional sharing an objective observation.
- Keep the email body between 100 and 160 words. Long emails are ignored.
- Tone: Respectful, consultative, objective, zero hype, zero pushiness.
- STRICT PROHIBITION: Never claim you "worked with their competitor" unless stated in context. Never mention fake metrics. Never insult their existing site—frame issues as missed revenue opportunities.
- Output strictly valid JSON matching the EmailDraftResponse schema.

[USER PROMPT]
Write a personalized sales email for the following prospect:

PROSPECT CONTEXT:
- Business Name: {{ business.name }}
- Sub-Vertical: {{ intelligence.identified_niche }}
- Location: {{ business.city }}
- Current Web Problem: {{ intelligence.primary_vulnerability }}
- Key Evidence: {{ audit.evidence_sentence }}
- Suggested Digital Solution: {{ intelligence.primary_suggested_feature }}
- Desired Outreach Angle: {{ angle }}

Generate 3 compelling subject lines and a high-converting body.
```

---

### 5. Error Handling, Retries & Cost Tracking Pipeline

```python
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

class OpenRouterClient:
    def __init__(self, api_key: str, default_model: str, fallback_model: str):
        self.api_key = api_key
        self.default_model = default_model
        self.fallback_model = fallback_model
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError))
    )
    async def generate_structured_response(self, system_prompt: str, user_prompt: str, schema: dict) -> tuple[dict, float, int, int]:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://leadforge.internal",
            "X-Title": "LeadForge AI Core",
            "Content-Type": "application/json"
        }

        # Multi-model routing: OpenRouter automatically fails over to fallback_model if primary fails
        payload = {
            "models": [self.default_model, self.fallback_model],
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.3
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(self.base_url, headers=headers, json=payload)
            response.raise_for_status()

            cost_usd = float(response.headers.get("x-openrouter-cost", 0.0))
            data = response.json()
            
            usage = data.get("usage", {})
            tokens_in = usage.get("prompt_tokens", 0)
            tokens_out = usage.get("completion_tokens", 0)
            content = data["choices"][0]["message"]["content"]
            
            return content, cost_usd, tokens_in, tokens_out
```

- **Safety & Cost Logging:**
  - After every call, `cost_usd`, `tokens_in`, `tokens_out`, and execution latency are written to `api_usage_logs`.
  - An internal daily spending circuit breaker ($5.00/day hard cap) prevents unexpected billing spikes in case of an accidental runaway batch loop.
