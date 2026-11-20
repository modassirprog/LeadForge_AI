# Environment Variables Specification
## LeadForge AI — Configuration Reference & Secret Management Guide

---

### 1. Overview & Security Protocols

LeadForge AI strictly adheres to the Twelve-Factor App methodology for configuration:
1. **Zero Hardcoded Secrets:** All credentials, database connection strings, and API keys must be loaded from environment variables at runtime.
2. **Environment Separation:** Maintain strictly isolated files for local development (`.env.local`), staging, and production environments.
3. **Secret Classification:**
   - `CRITICAL_SECRET`: Master encryption keys, database passwords, OAuth client secrets. Must be encrypted in secret managers (e.g. Railway Secrets, Supabase Vault, Vercel Environment Variables).
   - `CONFIDENTIAL`: API keys (OpenRouter, Google Maps). Never exposed to client-side code.
   - `PUBLIC`: Safe for client-side injection (prefixed with `NEXT_PUBLIC_` in Next.js).

---

### 2. Backend Environment Variables (`backend/.env.example`)

```bash
# ==============================================================================
# LEADFORGE AI — BACKEND CONFIGURATION
# Copy this file to backend/.env and populate with your credentials.
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. APPLICATION & SERVER SETTINGS
# ------------------------------------------------------------------------------
ENVIRONMENT=development                     # development | staging | production
APP_NAME="LeadForge AI Core"
APP_VERSION=1.0.0
DEBUG=True
HOST=0.0.0.0
PORT=8000
BACKEND_CORS_ORIGINS=["http://localhost:3000","https://leadforge.agency.com"]

# ------------------------------------------------------------------------------
# 2. DATABASE & CACHE
# ------------------------------------------------------------------------------
# PostgreSQL Connection URL (Postgres 15+ compatible with Supabase / Neon / RDS)
DATABASE_URL="postgresql+asyncpg://postgres:your_password@localhost:5432/leadforge_ai"
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# Redis URL (Used by ARQ worker queue and rate limiting)
REDIS_URL="redis://localhost:6379/0"

# ------------------------------------------------------------------------------
# 3. SECURITY & CRYPTOGRAPHY
# ------------------------------------------------------------------------------
# Secret key for signing internal JWT session tokens (generate using: openssl rand -hex 32)
JWT_SECRET_KEY="replace_with_a_64_character_hex_random_secret_string_here"
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440            # 24 hours

# Master Encryption Key for AES-256-GCM (Used to encrypt OAuth tokens at rest)
# Must be exactly 32 bytes (64 hex characters: openssl rand -hex 32)
MASTER_ENCRYPTION_KEY="replace_with_a_64_character_hex_master_encryption_key"

# ------------------------------------------------------------------------------
# 4. OPENROUTER AI GATEWAY (SINGLE CONSOLIDATED AI PROVIDER)
# ------------------------------------------------------------------------------
OPENROUTER_API_KEY="sk-or-v1-your-openrouter-key-goes-here"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
OPENROUTER_SITE_URL="https://leadforge.agency.com"
OPENROUTER_SITE_NAME="LeadForge AI"

# Model Routing Configuration
OPENROUTER_TIER1_MODEL="deepseek/deepseek-chat"          # Classification & Cleanup
OPENROUTER_TIER1_FALLBACK="google/gemini-flash-1.5"
OPENROUTER_TIER2_MODEL="deepseek/deepseek-chat"          # Business Intelligence
OPENROUTER_TIER2_FALLBACK="openai/gpt-4o-mini"
OPENROUTER_TIER3_MODEL="anthropic/claude-3.5-sonnet"     # High-Converting Outreach
OPENROUTER_TIER3_FALLBACK="openai/gpt-4o-mini"

# Safety Circuit Breaker: Max daily AI spending in USD before blocking new requests
DAILY_AI_BUDGET_USD=5.00

# ------------------------------------------------------------------------------
# 5. GOOGLE CLOUD PLATFORM (PLACES & PAGESPEED)
# ------------------------------------------------------------------------------
# Google Places API (New) Key (Used for business discovery)
GOOGLE_PLACES_API_KEY="AIzaSyYourGoogleCloudApiKeyHere"

# Google PageSpeed Insights API Key (Can reuse same GCP key or separate restricted key)
GOOGLE_PAGESPEED_API_KEY="AIzaSyYourGoogleCloudApiKeyHere"

# ------------------------------------------------------------------------------
# 6. GOOGLE WORKSPACE / GMAIL OAUTH 2.0 (OUTREACH ENGINE)
# ------------------------------------------------------------------------------
# Configured in Google Cloud Console under APIs & Services > Credentials
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-yourClientSecretHere"
GOOGLE_OAUTH_REDIRECT_URI="http://localhost:8000/api/v1/auth/google/callback"

# ------------------------------------------------------------------------------
# 7. WEB CRAWLER & SSRF SAFEGUARD CONFIGURATION
# ------------------------------------------------------------------------------
CRAWLER_USER_AGENT="LeadForgeBot/1.0 (+https://leadforge.agency.com/crawler; contact@agency.com)"
CRAWLER_TIMEOUT_SECONDS=10
CRAWLER_MAX_REDIRECTS=3
CRAWLER_MAX_BODY_BYTES=1048576              # 1 MB maximum download cap
CRAWLER_CONCURRENCY_PER_DOMAIN=2            # Max 2 concurrent requests to the same domain

# ------------------------------------------------------------------------------
# 8. EMAIL OUTREACH & COMPLIANCE DEFAULTS
# ------------------------------------------------------------------------------
DEFAULT_DAILY_SEND_LIMIT=35                 # Strict cap to preserve domain deliverability
SENDING_WINDOW_START_HOUR=10                # 10:00 AM local prospect time
SENDING_WINDOW_END_HOUR=17                  # 05:00 PM local prospect time
MIN_SEND_DELAY_SECONDS=60                   # Minimum random jitter between sends
MAX_SEND_DELAY_SECONDS=180                  # Maximum random jitter between sends

# CAN-SPAM Compliance Agency Address (Appended automatically to outreach footers)
AGENCY_NAME="Apex Digital Studio"
AGENCY_PHYSICAL_ADDRESS="Unit 402, Cyber Tower, Hiranandani Estate, Thane, Maharashtra 400607, India"
AGENCY_CONTACT_EMAIL="outreach@apexdigital.in"
```

---

### 3. Frontend Environment Variables (`frontend/.env.example`)

```bash
# ==============================================================================
# LEADFORGE AI — FRONTEND CONFIGURATION
# Copy this file to frontend/.env.local and populate with your settings.
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. PUBLIC CONFIGURATION (EXPOSED TO BROWSER)
# ------------------------------------------------------------------------------
NEXT_PUBLIC_APP_NAME="LeadForge AI"
NEXT_PUBLIC_APP_DESCRIPTION="Agency Lead Intelligence & Web Discovery Platform"
NEXT_PUBLIC_API_BASE_URL="http://localhost:8000/api/v1"

# Environment identifier
NEXT_PUBLIC_ENVIRONMENT="development"       # development | production

# Default geographic search parameters
NEXT_PUBLIC_DEFAULT_COUNTRY="India"
NEXT_PUBLIC_DEFAULT_CITY="Mumbai"

# ------------------------------------------------------------------------------
# 2. INTERNAL NEXT.JS SERVER CONFIGURATION (SERVER-SIDE ONLY)
# ------------------------------------------------------------------------------
# Backend internal service token for secure Server Component requests
INTERNAL_BACKEND_API_KEY="replace_with_internal_service_token_matching_backend"
```

---

### 4. Configuration Variable Reference Matrix

| Variable | Scope | Classification | Description | Default / Example |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Backend | `CRITICAL_SECRET` | Async PostgreSQL connection string | `postgresql+asyncpg://...` |
| `MASTER_ENCRYPTION_KEY`| Backend | `CRITICAL_SECRET` | 32-byte key for AES-256 OAuth token vault | `64-char hex string` |
| `JWT_SECRET_KEY` | Backend | `CRITICAL_SECRET` | Secret key for signing operator session JWTs | `64-char hex string` |
| `OPENROUTER_API_KEY` | Backend | `CONFIDENTIAL` | OpenRouter unified LLM gateway API key | `sk-or-v1-...` |
| `GOOGLE_PLACES_API_KEY`| Backend | `CONFIDENTIAL` | Google Cloud API key for Places New API | `AIzaSy...` |
| `GOOGLE_CLIENT_SECRET` | Backend | `CRITICAL_SECRET` | Google Cloud OAuth2 Client Secret for Gmail | `GOCSPX-...` |
| `DAILY_AI_BUDGET_USD` | Backend | `CONFIG` | Safety circuit breaker to cap AI spend per day | `5.00` |
| `DEFAULT_DAILY_SEND_LIMIT`| Backend | `CONFIG` | Max cold outreach emails sent per day | `35` |
| `NEXT_PUBLIC_API_BASE_URL`| Frontend | `PUBLIC` | URL of the FastAPI backend service | `http://localhost:8000/api/v1`|
