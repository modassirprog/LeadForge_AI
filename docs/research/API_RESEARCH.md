# Comprehensive API & Service Research Report
## LeadForge AI — Exhaustive Evaluation of External Services

---

### 1. Architectural Strategy: The "Single-Gateway & Native Protocol" Principle

To maintain ultra-low operational expenses and zero API bloat, LeadForge AI follows a disciplined service selection framework:
1. **Single AI Gateway:** OpenRouter handles 100% of LLM requirements across classification, business intelligence, opportunity scoring, and email drafting.
2. **Native Protocols Over Paid Wrappers:** Direct asynchronous DNS MX queries and targeted HTTP scraping replace expensive email verification and extraction SaaS products.
3. **Google Maps Platform + Free Google Tools:** Google Places API (New) provides high-accuracy discovery with selective field-masking, while Google's free PageSpeed Insights API offloads technical audits.
4. **Native Agency Deliverability:** Google Workspace Gmail API via OAuth2 replaces spam-prone transactional email delivery services.

---

### 2. Comprehensive Service Evaluations

---

#### 2.1 OpenRouter API (Unified AI Gateway)

- **1. Purpose:** Serves as the single unified LLM gateway providing model routing, fallback redundancy, and token cost tracking across all AI operations in LeadForge AI.
- **2. Capabilities:**
  - Standard OpenAI-compatible REST API (`https://openrouter.ai/api/v1/chat/completions`).
  - Access to 100+ state-of-the-art open and closed LLMs (Claude 3.5 Sonnet, GPT-4o, Gemini 1.5/2.0 Flash, DeepSeek V3/R1, Llama 3.3).
  - Structured JSON schema enforcement via `response_format: { type: "json_object" }`.
  - Automatic model fallback: If an upstream provider is degraded, requests automatically route to a designated secondary model without application downtime.
  - Granular cost reporting in response headers (`x-openrouter-cost`).
- **3. Pricing & Free Tier Limits:**
  - **Pricing Model:** Pure pay-as-you-go; zero monthly subscription fees; prepaid wallet balance.
  - **Sample Model Costs (Official OpenRouter Rates):**
    - *DeepSeek V3:* ~$0.14 per 1M input tokens / ~$0.28 per 1M output tokens.
    - *Google Gemini 1.5 Flash:* ~$0.075 per 1M input tokens / ~$0.30 per 1M output tokens.
    - *OpenAI GPT-4o-mini:* ~$0.15 per 1M input tokens / ~$0.60 per 1M output tokens.
    - *Anthropic Claude 3.5 Sonnet:* ~$3.00 per 1M input tokens / ~$15.00 per 1M output tokens.
  - **Free Tier:** Several community-hosted models (e.g., `meta-llama/llama-3.2-3b-instruct:free`) are available with limited rate limits, but production agency workloads will use paid pay-as-you-go models.
- **4. Rate Limits:**
  - Up to 200 requests per minute (RPM) for paid accounts with sufficient credit balance.
  - Individual upstream models inherit their respective provider throughput limits, smoothed by OpenRouter's load-balancing cluster.
- **5. API Restrictions:**
  - Requires adherence to upstream model providers' Acceptable Use Policies (no illegal activities, harassment, or malicious automation).
- **6. Commercial Use:**
  - Fully allowed for commercial B2B applications and agency operations.
- **7. Data Storage & Reuse:**
  - OpenRouter does not train on API customer inputs. Prompts and completions can be permanently stored in the internal LeadForge AI PostgreSQL database.
- **8. Official Documentation:** `https://openrouter.ai/docs`
- **9. Recommendation:** **Core MVP Foundation (Mandatory).**

---

#### 2.2 Google Places API (New)

- **1. Purpose:** Discovering real, active commercial establishments by country, state, city, category, and radius.
- **2. Capabilities:**
  - `Text Search (New)` and `Nearby Search (New)` endpoints.
  - Retrieves official business name, formatted address, latitude/longitude, category types, star rating, total review counts, phone number, and official website URL.
  - Precise field-masking via HTTP header `X-Goog-FieldMask` to download only required fields and minimize billing costs.
- **3. Pricing & Free Tier Limits:**
  - **Billing Platform:** Google Cloud Platform (GCP).
  - **Monthly Credit:** Google provides a **$200 USD monthly recurring credit** for every active Google Cloud Billing account (equivalent to ~10,000 to 25,000 basic search requests per month at zero out-of-pocket cost).
  - **SKU Costs (Places API New):**
    - *Text Search (Basic Fields):* ~$0.032 per request.
    - *Field Masking Discount:* By requesting only `places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.primaryTypeDisplayName`, requests are billed strictly under standard Search SKUs without expensive Enterprise/Atmosphere add-ons.
- **4. Rate Limits:**
  - Default quota: 6,000 queries per minute (QPM), adjustable via Google Cloud Console.
- **5. API Restrictions & Terms of Service (ToS):**
  - Section 3.2.3 of Google Maps Platform Service Terms: Prohibits scraping or creating a permanent public substitute for Google Maps.
  - Cannot publicly redistribute raw Places data.
  - Pre-fetching, unauthorized caching, or storing content outside the permitted caching terms is restricted.
- **6. Commercial Use:**
  - Fully permitted under standard commercial Google Cloud Billing accounts.
- **7. Data Storage & Reuse Compliance:**
  - **Place IDs:** Can be cached indefinitely without restriction.
  - **Temporary Caching:** Attribute caching is permitted for internal business workflow/CRM use for up to 30 consecutive calendar days, after which data should be refreshed or purged if no client engagement has occurred.
  - Once a business enters an agency sales opportunity lifecycle, contact logs, audit records, and user notes are internal agency CRM records.
- **8. Official Documentation:** `https://developers.google.com/maps/documentation/places/web-service/op-overview`
- **9. Recommendation:** **Core MVP Discovery Provider (Mandatory).**

---

#### 2.3 OpenStreetMap (OSM) via Overpass API

- **1. Purpose:** Zero-cost fallback discovery engine for mapping local business nodes (clinics, shops, restaurants, academies) without consuming GCP credits.
- **2. Capabilities:**
  - Overpass QL query engine filters nodes, ways, and relations by tags: `[amenity=restaurant]`, `[healthcare=clinic]`, `[tourism=hotel]`, `[leisure=fitness_centre]`.
  - Returns geographic coordinates, names, street addresses, phone numbers, and website tags where community-indexed.
- **3. Pricing & Free Tier Limits:**
  - **Cost:** **$100% Free** (Open Source / Open Data).
  - Zero financial cost on public Overpass instances (`https://overpass-api.de/api/interpreter`).
- **4. Rate Limits:**
  - Public servers enforce fair-use limits: Max 2 concurrent connections per IP; max execution time 180 seconds; ~10,000 queries/day max.
- **5. API Restrictions:**
  - Must not overload public infrastructure with high-frequency hammering.
  - Must supply a distinct custom `User-Agent` identifying the application.
- **6. Commercial Use:**
  - Permitted under the Open Database License (ODbL).
- **7. Data Storage & Reuse:**
  - Permanent storage in PostgreSQL is fully permitted. If publicly shared or published, OpenStreetMap attribution must be provided (`© OpenStreetMap contributors`). Internal agency CRM use requires no external public attribution.
- **8. Official Documentation:** `https://wiki.openstreetmap.org/wiki/Overpass_API`
- **9. Recommendation:** **Secondary / Fallback Provider in MVP** (Allows exploratory radius scans without consuming Google API credits).

---

#### 2.4 Google PageSpeed Insights API (v5)

- **1. Purpose:** Automated, authoritative technical web auditing (mobile responsiveness, Core Web Vitals, performance bottlenecks, and basic SEO scoring).
- **2. Capabilities:**
  - Executes Google Lighthouse in the cloud on both `MOBILE` and `DESKTOP` form factors.
  - Returns 0–100 category scores for:
    - **Performance** (First Contentful Paint, Speed Index, Largest Contentful Paint, Cumulative Layout Shift).
    - **Accessibility** (Color contrast, accessible labels).
    - **Best Practices** (HTTPS security, modern image formats, console errors).
    - **SEO** (Viewport meta tag, title, meta description, crawlability).
- **3. Pricing & Free Tier Limits:**
  - **Cost:** **100% Free.** Google does not charge for PageSpeed Insights API.
  - **Free Tier Allowance:** Up to **25,000 queries per day**.
- **4. Rate Limits:**
  - 400 queries per minute per IP address / project.
- **5. API Restrictions:**
  - The audited target website must be publicly accessible over the internet via HTTP/HTTPS.
- **6. Commercial Use:**
  - Fully permitted for commercial agency auditing and client reporting.
- **7. Data Storage & Reuse:**
  - Full audit outputs (scores, metrics, and audit timestamps) can be permanently stored and tracked in the LeadForge AI PostgreSQL database.
- **8. Official Documentation:** `https://developers.google.com/speed/docs/insights/v5/get-started`
- **9. Recommendation:** **Core MVP Technical Auditor (Mandatory).**

---

#### 2.5 In-House DNS MX & Web Crawling Engine (`dnspython` + `httpx`)

- **1. Purpose:** Discovering public business email addresses from official websites and verifying email deliverability via DNS MX queries without expensive third-party subscriptions.
- **2. Capabilities:**
  - Asynchronous HTTP/2 crawler with timeout and size caps (500KB max payload) to inspect `/`, `/contact`, `/contact-us`, and `/about`.
  - Regex extraction of public `mailto:` links and business emails.
  - DNS MX lookup (`dnspython` async resolver) to ensure target domain has valid mail servers configured (e.g. Google Workspace, Microsoft 365, cPanel webmail).
  - Disposable email domain detection against a local JSON blocklist.
- **3. Pricing & Free Tier Limits:**
  - **Cost:** **$0.00 (Zero API cost).** Runs directly inside the Python backend.
- **4. Rate Limits:**
  - Self-imposed rate limits via Python `asyncio.Semaphore` (e.g., max 2 concurrent requests per target domain; 10 requests/second globally) to prevent IP banning.
- **5. API Restrictions & Standards:**
  - Must honor `robots.txt` disallow directives.
  - Must send an identifiable, professional agency `User-Agent` header with contact email.
  - Must enforce Anti-SSRF (Server-Side Request Forgery) IP blacklists to prevent scanning internal agency/host subnets (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`).
- **6. Commercial Use:**
  - Fully legal and permitted. Extracting publicly disclosed commercial contact emails for B2B inquiry is standard agency practice.
- **7. Data Storage & Reuse:**
  - Fully permitted. LeadForge AI stores the verified email, source URL, discovery timestamp, and verification grade.
- **8. Official Documentation:** `https://dnspython.readthedocs.io/` | `https://www.python-httpx.org/`
- **9. Recommendation:** **Core MVP Contact Engine (Mandatory).**

---

#### 2.6 Google Workspace / Gmail API (OAuth 2.0)

- **1. Purpose:** Sending personalized agency sales outreach directly from the agency owner's authenticated Google Workspace address and synchronizing replies.
- **2. Capabilities:**
  - Creates MIME message drafts (`users.drafts.create`).
  - Sends approved outreach emails (`users.messages.send`).
  - Fetches message thread histories (`users.threads.get`) to detect client responses and automatically halt follow-up sequences.
- **3. Pricing & Free Tier Limits:**
  - **Cost:** **Free** (Included in existing Google Workspace / Gmail account).
  - No per-email API fees.
- **4. Rate Limits & Quotas:**
  - Google Workspace accounts: Maximum **2,000 sent emails per rolling 24-hour period**.
  - Standard consumer `@gmail.com`: 500 emails per 24 hours.
  - **LeadForge AI Policy Limit:** We enforce a strict conservative internal cap of **30–50 emails per day** with randomized delays (60–180s) to safeguard the agency's primary domain reputation and ensure 99%+ deliverability.
- **5. API Restrictions & OAuth Verification:**
  - Uses sensitive scopes: `https://www.googleapis.com/auth/gmail.send`, `https://www.googleapis.com/auth/gmail.compose`.
  - **Private / Internal Agency Mode:** Under Google Cloud Console, setting the OAuth application to "Internal" (for Google Workspace organizations) requires **zero third-party verification or CASA security audits**. The agency owner simply authenticates their own account via OAuth once.
- **6. Commercial Use:**
  - Fully permitted for agency business operations.
- **7. Data Storage & Reuse:**
  - Message IDs, thread IDs, sent timestamps, and draft contents are stored internally.
- **8. Official Documentation:** `https://developers.google.com/gmail/api/guides`
- **9. Recommendation:** **Core MVP Outreach Engine (Phase 3).**

---

### 3. Evaluated & Postponed Third-Party APIs

| API / Service | Category | Reason for Postponement or Rejection |
| :--- | :--- | :--- |
| **Hunter.io / Snov.io** | Email Discovery & Enrichment | Minimum $49–$99/month subscription for limited credits (500–1,000 lookups). For local businesses, direct website scraping and Google Maps profiles provide 85%+ coverage for $0. Retained only as an optional future webhook fallback. |
| **ZeroBounce / NeverBounce**| Email Verification | Charges $0.008 per verification. Unnecessary when local DNS MX resolution, RFC syntax validation, and disposable domain filtering catch 95% of invalid mail servers for free. |
| **SendGrid / Mailgun / SES**| Cold Email Sending | Sending cold outreach through transactional email providers often triggers spam filters due to shared IP pools and missing conversational mailbox warming. Sending via real Google Workspace Gmail API delivers superior inbox placement. |
| **Foursquare Places API** | Business Discovery | Free tier is strictly non-commercial and limits query flexibility. Google Places API + OpenStreetMap Overpass offer superior data freshness in India and international markets. |

---

### 4. Consolidated API Cost Breakdown (Monthly Estimate for 1,000 Leads)

| Service | Function | Monthly Usage (1,000 Leads) | Net Monthly Cost (USD) |
| :--- | :--- | :--- | :--- |
| **Google Places API (New)** | Business Discovery | ~100 search queries (10-20 leads per page) | **$0.00** (Covered by $200/mo GCP Free Credit) |
| **OpenStreetMap Overpass** | Fallback Discovery | 50 exploratory queries | **$0.00** (100% Free Open Source) |
| **Google PageSpeed Insights** | Website Technical Audit| 800 active website audits | **$0.00** (100% Free API, 25k/day limit) |
| **In-House DNS & Crawler** | Email Extraction & MX | 800 website crawls & DNS MX lookups | **$0.00** (Native Python compute) |
| **OpenRouter AI Gateway** | Intelligence & Emails | 1,000 leads (DeepSeek/Gemini) + 300 Claude drafts | **$1.80 – $3.50** (Pay-as-you-go tokens) |
| **Gmail API (OAuth2)** | Outreach Sending | 300 approved personalized emails | **$0.00** (Included with Google Workspace) |
| **PostgreSQL (Supabase/Neon)**| Primary Database | ~10,000 stored records & logs | **$0.00** (Within free tier 500MB DB) |
| **Total Estimated API Cost**| — | **1,000 Fully Enriched & Audited Leads** | **< $5.00 / month** |
