# Project Directory Structure & Organization
## LeadForge AI — Monorepo Architecture & Codebase Conventions

---

### 1. Monorepo Organization Overview

The LeadForge AI repository is organized as a clean, decoupled monorepo containing the **Next.js Frontend** (`frontend/`), the **Python FastAPI Backend** (`backend/`), and the container orchestration configuration (`docker/`).

```
LeadForge AI/
├── .github/                      # CI/CD Workflows (linting, tests, security scan)
├── docker/                       # Dockerfiles and production compose files
├── docs/                         # Architecture, PRD, and API research documents
├── frontend/                     # Next.js 14+ App Router Frontend
├── backend/                      # Python FastAPI Async Application Server & Workers
├── .gitignore                    # Global Git exclusion rules
├── docker-compose.yml            # Local development orchestration (Postgres, Redis, Backend, Frontend)
└── README.md                     # High-level developer setup guide
```

---

### 2. Complete File & Directory Tree

```
LeadForge AI/
│
├── frontend/                                   # Next.js App Router Client Application
│   ├── public/                                 # Static assets, logos, favicon
│   ├── src/
│   │   ├── app/                                # App Router Pages & Layouts
│   │   │   ├── (auth)/                         # Authentication route group
│   │   │   │   └── login/page.tsx
│   │   │   ├── (dashboard)/                    # Authenticated dashboard route group
│   │   │   │   ├── layout.tsx                  # Global dashboard sidebar & header
│   │   │   │   ├── page.tsx                    # Overview metrics & quick actions
│   │   │   │   ├── discovery/                  # Module A: Discovery Search
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── leads/                      # Module G: Lead CRM Data Table
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx           # Lead Detail & Audit Breakdown
│   │   │   │   ├── drafts/                     # Module F: AI Draft Review Queue
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── campaigns/                  # Module H: Email Campaigns & Sending
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── analytics/                  # Cost, Token & Outreach Analytics
│   │   │   │   │   └── page.tsx
│   │   │   │   └── settings/                   # Agency profile, API keys, AI routing
│   │   │   │       └── page.tsx
│   │   │   ├── api/                            # Next.js Route Handlers (if needed)
│   │   │   ├── globals.css                     # Tailwind CSS directives & theme variables
│   │   │   └── layout.tsx                      # Root HTML layout & providers
│   │   │
│   │   ├── components/                         # UI Component Library
│   │   │   ├── ui/                             # shadcn/ui primitives (button, dialog, table, badge)
│   │   │   ├── dashboard/                      # Dashboard cards, metric charts, sidebar
│   │   │   ├── discovery/                      # Search forms, radius pickers, category filters
│   │   │   ├── leads/                          # TanStack virtualized data table, score badges
│   │   │   ├── audits/                         # Lighthouse gauge circles, mobile preview cards
│   │   │   ├── outreach/                       # Slide-over draft review drawer, markdown editor
│   │   │   └── shared/                         # Theme toggle, confirmation dialogs, toasts
│   │   │
│   │   ├── hooks/                              # Custom React Hooks
│   │   │   ├── use-leads.ts                    # TanStack Query hook for lead fetching/filtering
│   │   │   ├── use-discovery.ts                # Search execution & progress SSE stream
│   │   │   ├── use-email-drafts.ts             # Draft review & approval mutation hooks
│   │   │   └── use-debounce.ts
│   │   │
│   │   ├── lib/                                # Client Utilities & Config
│   │   │   ├── api-client.ts                   # Axios / fetch instance with auth interceptors
│   │   │   ├── utils.ts                        # Tailwind class merger (cn) & formatters
│   │   │   └── constants.ts                    # Business categories, statuses, score weights
│   │   │
│   │   └── types/                              # TypeScript Type Definitions
│   │       ├── business.ts                     # Business, Location, Website interfaces
│   │       ├── audit.ts                        # Technical audit & PageSpeed types
│   │       ├── intelligence.ts                 # AI analysis & opportunity score types
│   │       └── outreach.ts                     # Email draft & campaign types
│   │
│   ├── .env.example                            # Frontend environment template
│   ├── next.config.mjs                         # Next.js configuration
│   ├── package.json                            # Node dependencies & scripts
│   ├── tailwind.config.ts                      # Tailwind design tokens & plugins
│   └── tsconfig.json                           # TypeScript compiler options
│
├── backend/                                    # Python FastAPI Application & Workers
│   ├── alembic/                                # Database Migrations (SQLAlchemy)
│   │   ├── versions/                           # Timestamped migration scripts
│   │   └── env.py                              # Alembic migration environment
│   │
│   ├── app/
│   │   ├── api/                                # REST API Route Endpoints
│   │   │   ├── v1/
│   │   │   │   ├── router.py                   # Aggregated v1 APIRouter
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── auth.py                 # User authentication & JWT issuance
│   │   │   │   │   ├── discovery.py            # Trigger searches & fetch history
│   │   │   │   │   ├── businesses.py           # CRUD, filter, and export leads
│   │   │   │   │   ├── audits.py               # On-demand website technical audits
│   │   │   │   │   ├── intelligence.py         # AI analysis & opportunity score recalculation
│   │   │   │   │   ├── outreach.py             # Draft review, approval, Gmail OAuth trigger
│   │   │   │   │   ├── campaigns.py            # Campaign management & suppression list
│   │   │   │   │   └── settings.py             # System settings & API usage logs
│   │   │   └── deps.py                         # FastAPI dependency injections (DB session, current user)
│   │   │
│   │   ├── core/                               # Core Configuration & Security
│   │   │   ├── config.py                       # Pydantic BaseSettings loading from .env
│   │   │   ├── database.py                     # Async SQLAlchemy engine & session maker
│   │   │   ├── security.py                     # Password hashing (bcrypt) & JWT handling
│   │   │   └── vault.py                        # AES-256-GCM encryption for OAuth tokens
│   │   │
│   │   ├── models/                             # SQLAlchemy 2.0 Database Models
│   │   │   ├── __init__.py                     # Package exports
│   │   │   ├── user.py                         # User & Auth models
│   │   │   ├── business.py                     # Business & BusinessLocation models
│   │   │   ├── website.py                      # Website & WebsiteAudit models
│   │   │   ├── contact.py                      # Contact & EmailVerification models
│   │   │   ├── intelligence.py                 # AIAnalysis & OpportunityScore models
│   │   │   ├── outreach.py                     # Campaign, EmailDraft, OutreachHistory models
│   │   │   └── system.py                       # SearchHistory, SuppressionList, APIUsageLog models
│   │   │
│   │   ├── schemas/                            # Pydantic v2 Request & Response DTOs
│   │   │   ├── discovery.py                    # Search query schemas
│   │   │   ├── business.py                     # Business responses & filter query params
│   │   │   ├── audit.py                        # Website audit findings & PageSpeed DTOs
│   │   │   ├── intelligence.py                 # AI structured outputs & score breakdown
│   │   │   ├── outreach.py                     # Draft approvals & outreach payloads
│   │   │   └── common.py                       # Pagination & standard JSON response wrappers
│   │   │
│   │   ├── services/                           # Pure Business Logic & External Integrations
│   │   │   ├── discovery/
│   │   │   │   ├── google_places.py            # Google Places API (New) client
│   │   │   │   ├── overpass.py                 # OpenStreetMap Overpass client
│   │   │   │   └── deduplicator.py             # Business deduplication hashing engine
│   │   │   │
│   │   │   ├── auditing/
│   │   │   │   ├── url_classifier.py           # Social vs Official domain detection
│   │   │   │   ├── pagespeed.py                # Google PageSpeed Insights client
│   │   │   │   └── html_inspector.py           # SSL, viewport meta, CMS detector
│   │   │   │
│   │   │   ├── crawling/
│   │   │   │   ├── crawler.py                  # SSRF-safe async HTTP crawler
│   │   │   │   ├── email_extractor.py          # Regex & mailto extraction engine
│   │   │   │   └── dns_verifier.py             # Async DNS MX resolver & disposable filter
│   │   │   │
│   │   │   ├── scoring/
│   │   │   │   └── engine.py                   # 0-100 Opportunity Score mathematical model
│   │   │   │
│   │   │   ├── ai/
│   │   │   │   ├── openrouter.py               # Unified OpenRouter client with multi-model fallback
│   │   │   │   ├── prompt_templates.py         # Versioned prompt strings
│   │   │   │   └── token_tracker.py            # Usage & cost tracking recorder
│   │   │   │
│   │   │   └── outreach/
│   │   │       ├── gmail_oauth.py              # Google OAuth2 authorization & token manager
│   │   │       ├── mime_builder.py             # RFC 2822 email payload builder
│   │   │       └── sender.py                   # Safe throttled delivery engine with jitter
│   │   │
│   │   ├── workers/                            # Background Worker & Job Definitions
│   │   │   ├── arq_worker.py                   # ARQ worker startup, Redis connection, task mappings
│   │   │   └── tasks/
│   │   │       ├── discovery_tasks.py          # Asynchronous discovery batch processing
│   │   │       ├── audit_tasks.py              # Asynchronous website auditing jobs
│   │   │       └── outreach_tasks.py           # Jittered email sending & reply sync cron
│   │   │
│   │   └── main.py                             # FastAPI application factory & lifespan handler
│   │
│   ├── tests/                                  # Pytest Test Suite
│   │   ├── conftest.py                         # Test fixtures & test DB session
│   │   ├── test_discovery.py                   # Google Places & Overpass parser tests
│   │   ├── test_crawler_ssrf.py                # SSRF safeguard boundary tests
│   │   ├── test_scoring.py                     # Mathematical scoring formula tests
│   │   └── test_ai_schema.py                   # Pydantic structured output validation tests
│   │
│   ├── .env.example                            # Backend environment template
│   ├── alembic.ini                             # Alembic migration configuration
│   ├── pyproject.toml                          # Poetry / pip dependency manifest
│   └── Dockerfile                              # Backend container definition
│
├── docker/                                     # Containerization Support
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── nginx.conf                              # Optional reverse proxy configuration
│
├── docker-compose.yml                          # Multi-container local orchestration
└── README.md                                   # Getting started documentation
```

---

### 3. Coding Conventions & Architectural Principles

1. **Service Layer Isolation:**
   - FastAPI endpoint handlers in `app/api/` must remain thin. They parse and validate input DTOs, inject dependencies, call the appropriate service class in `app/services/`, and return responses.
   - All complex business logic (e.g. lead scoring, crawling, OpenRouter calls) lives strictly in `app/services/`.
2. **Explicit Pydantic Serialization:**
   - Endpoints must always declare `response_model=...`. Raw SQLAlchemy models must never be returned directly over the wire to prevent accidental leakage of sensitive attributes (e.g. encrypted tokens or internal hashes).
3. **Async Everywhere:**
   - All database calls use async SQLAlchemy (`await session.execute(...)`).
   - All external HTTP calls use `httpx.AsyncClient` or asynchronous DNS queries (`dns.asyncresolver`).
4. **Resilient Frontend State:**
   - The Next.js frontend uses **TanStack Query** for caching and background refetching. Optimistic updates are used when marking leads as `REJECTED`, `FAVORITE`, or updating follow-up notes.
