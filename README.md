::: {align="center"}
# LeadForge AI

### Find the businesses the web forgot. Turn opportunity into outreach.

**An AI-powered lead discovery and business intelligence platform for
web development agencies.**

Discover local businesses with missing or broken websites, understand
their digital gaps, verify public contact details, score opportunities
transparently, and prepare personalized, evidence-based outreach.

`<br/>`{=html}

[![Next.js](https://img.shields.io/badge/Frontend-Next.js-111827?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind
CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-7C3AED?style=for-the-badge)](https://openrouter.ai/)
[![License:
MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](https://opensource.org/licenses/MIT)

`<br/>`{=html}

**Discover  ·  Audit  ·  Score  ·  Verify  ·  Pitch  ·  Manage**
:::

------------------------------------------------------------------------

## At a glance

LeadForge AI helps web development and digital agencies find local
businesses that may need a better web presence---without relying
entirely on expensive, generic lead databases.

  -----------------------------------------------------------------------
      Discover          Diagnose         Prioritize         Reach out
  ----------------- ----------------- ----------------- -----------------
     Find local      Audit websites    Rank leads with       Prepare
    businesses by      and digital       explainable      personalized,
      geography         presence           scores         fact-grounded
                                                             pitches

  -----------------------------------------------------------------------

### Why it matters

A business with no website, a broken mobile experience, or an outdated
online presence can represent a real opportunity for an agency.
LeadForge brings discovery and qualification into one workflow, so teams
can spend less time collecting scattered information and more time
evaluating relevant prospects.

------------------------------------------------------------------------

## Table of contents

-   [Core capabilities](#core-capabilities)
-   [How the workflow works](#how-the-workflow-works)
-   [Opportunity scoring](#opportunity-scoring)
-   [Technology stack](#technology-stack)
-   [Architecture](#architecture)
-   [Getting started](#getting-started)
-   [Configuration](#configuration)
-   [API reference](#api-reference)
-   [Repository structure](#repository-structure)
-   [Security and responsible
    outreach](#security-and-responsible-outreach)
-   [Development roadmap](#development-roadmap)
-   [Contributing](#contributing)
-   [License](#license)

------------------------------------------------------------------------

## Core capabilities

### 01 --- Live geographic business discovery

Find businesses across selected locations and build a searchable pool of
potential leads.

-   **OpenStreetMap Overpass** discovery, with no API key required.
-   Optional **Google Places API** enrichment for details such as phone
    numbers, ratings, and official websites.
-   Geographic filters from country and state down to city, locality,
    and radius.
-   Deduplication to reduce repeated records and unnecessary API usage.

### 02 --- Technical website intelligence

Go beyond whether a business has a URL. Evaluate the quality and status
of its web presence.

  -----------------------------------------------------------------------
  Check                               What it identifies
  ----------------------------------- -----------------------------------
  Website classification              `NO_WEBSITE`, `SOCIAL_ONLY`,
                                      `BROKEN_OR_INACTIVE`,
                                      `ACTIVE_OFFICIAL`

  SSL / HTTPS                         Certificate and secure-connection
                                      status

  Mobile experience                   Mobile viewport responsiveness

  CMS detection                       WordPress, Wix, Squarespace,
                                      Shopify, or custom

  PageSpeed Insights                  Performance, SEO, Accessibility,
                                      FCP, and LCP
  -----------------------------------------------------------------------

The crawler includes SSRF protections intended to prevent requests to
private and internal network addresses.

### 03 --- Explainable opportunity scoring

Each lead receives an **Opportunity Score from 0 to 100**. The score is
composed of four weighted dimensions:

``` text
┌────────────────────────────────────────────────────┐
│              LEAD OPPORTUNITY SCORE                 │
├────────────────────────────────────────────────────┤
│  Website Deficit          35 points                 │
│  Commercial Viability     30 points                 │
│  Contact Accessibility   20 points                 │
│  Agency Fit               15 points                 │
├────────────────────────────────────────────────────┤
│  TOTAL                   100 points                 │
└────────────────────────────────────────────────────┘
```

The itemized breakdown makes the score easier to interpret: an agency
can see why a prospect ranks highly instead of relying on an unexplained
AI-generated rating.

### 04 --- Public contact discovery and DNS MX checks

Find publicly listed contact information and assess whether the domain
is configured to receive email.

-   Crawl common pages such as `/contact`, `/about`, `/contact-us`, and
    `/about-us`, along with website footers.
-   Extract and sanitize email addresses.
-   Filter disposable, placeholder, and image-extension addresses.
-   Perform asynchronous DNS MX record lookups using `dnspython`.

**Important:** An MX record check confirms that a domain has
mail-exchange configuration. It does not prove that a particular mailbox
exists or that a message will reach the inbox.

### 05 --- AI outreach studio

Generate contextual sales drafts through the OpenRouter gateway.

-   Access supported models---including Gemini, Claude, GPT, DeepSeek,
    and Llama---through one gateway, subject to provider and model
    availability.
-   Generate pitches using three outreach angles:
    -   **Growth / missed revenue**
    -   **Direct technical flaw**
    -   **Peer and competitor benchmark**
-   Use verified discovery and audit findings as the factual basis for
    outreach.
-   Generate three subject-line options and a personalized email body.
-   Open a draft in Gmail through a `mailto:` link.

AI-generated messages should be reviewed by a person before sending.

### 06 --- Lead CRM

Keep discovery, qualification, and follow-up work organized.

-   Searchable, sortable lead table powered by TanStack Table.
-   Lead status tracking.
-   Views for all leads, high-urgency leads (score ≥ 80), audited,
    contacted, and converted records.
-   CSV and JSON export.
-   Lead detail drawer with audit information, contact history, and
    outreach drafts.

### 07 --- System analytics

Monitor the pipeline with a consolidated view of:

-   Total leads and high-urgency leads.
-   Businesses with missing or social-only websites.
-   Contacted and converted leads.
-   Average opportunity score.
-   AI API token usage and cost tracking.

------------------------------------------------------------------------

## How the workflow works

``` mermaid
flowchart TD
    A[Choose a target geography] --> B[Discover local businesses]
    B --> C[Enrich business records]
    C --> D[Audit website and digital presence]
    D --> E[Discover public contact details]
    E --> F[Check domain MX records]
    F --> G[Calculate explainable opportunity score]
    G --> H[Generate evidence-based outreach draft]
    H --> I[Human review and approval]
    I --> J[Track lead in CRM]
```

**The principle:** use data to identify an opportunity, use verified
findings to explain it, and keep a human in control of outreach.

------------------------------------------------------------------------

## Technology stack

  -----------------------------------------------------------------------
  Layer                   Technology              Role
  ----------------------- ----------------------- -----------------------
  Frontend                Next.js App Router      Dashboard, routing, and
                                                  rendering

  UI components           shadcn/ui + Radix       Accessible interface
                                                  primitives

  Styling                 Tailwind CSS            Utility-first styling

  Data tables             TanStack Table v8       Lead table and data
                                                  interactions

  Data fetching           TanStack Query v5       Server-state management
                                                  and caching

  Backend                 Python FastAPI          Asynchronous API
                                                  service

  Validation              Pydantic v2             Request and response
                                                  schemas

  ORM                     SQLAlchemy 2.0          Database access

  Database                PostgreSQL / SQLite     Persistent lead storage

  AI gateway              OpenRouter              Unified model access

  HTTP client             httpx                   Asynchronous HTTP
                                                  requests

  HTML parsing            BeautifulSoup4          Website inspection and
                                                  extraction

  DNS                     dnspython               MX record lookups

  Background jobs         Redis + ARQ             Background task
                                                  processing

  Email workflow          Gmail API / `mailto:`   Human-reviewed outreach
                                                  workflow

  Charts                  Chart.js                Analytics
                                                  visualizations

  Background visuals      p5.js + Three.js        Cinematic visual
                                                  effects
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Architecture

LeadForge AI is organized as a decoupled frontend and backend
application.

``` text
LeadForge AI/
│
├── frontend/                  # Next.js application
│
├── backend/                   # FastAPI service
│   ├── app/
│   │   ├── api/v1/            # REST API routes
│   │   ├── core/              # Configuration, database, security
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   └── services/          # Business logic and integrations
│   └── main.py                # FastAPI application entry point
│
├── PRD.md
├── TECH_STACK.md
├── SYSTEM_ARCHITECTURE.md
├── PROJECT_STRUCTURE.md
├── DATABASE_SCHEMA.md
├── ENVIRONMENT_VARIABLES.md
├── SECURITY_AND_COMPLIANCE.md
├── DEVELOPMENT_ROADMAP.md
└── README.md
```

### High-level data flow

``` text
                 ┌──────────────────┐
                 │     Operator     │
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │   Next.js UI     │
                 └────────┬─────────┘
                          │ REST API
                 ┌────────▼─────────┐
                 │   FastAPI        │
                 └────────┬─────────┘
                          │
          ┌───────────────┼────────────────┐
          │               │                │
   ┌──────▼─────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │ PostgreSQL │  │ Discovery & │  │ AI / External│
   │  / SQLite  │  │ Audit Logic │  │ Integrations │
   └────────────┘  └─────────────┘  └──────────────┘
```

External integrations include OpenStreetMap Overpass, Google Places
(optional), PageSpeed Insights, OpenRouter, and Gmail-related workflows.

------------------------------------------------------------------------

## Getting started

### Prerequisites

Make sure the following are installed:

-   **Python 3.10+** and `pip`
-   **Node.js 18+** and `npm`
-   An **OpenRouter API key** for AI outreach (optional)
-   A **Google Places API key** for Places enrichment (optional)

### 1. Clone the repository

``` bash
git clone <your-repo-url>
cd "Lead Finder"
```

Replace `<your-repo-url>` with your repository URL.

### 2. Configure and start the backend

From the repository root:

``` bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Create your local environment file
cp backend/.env.example backend/.env
```

Open `backend/.env` and add the API keys you intend to use. Then start
FastAPI:

``` bash
python -m uvicorn backend.app.main:app --reload --port 8000
```

Backend endpoints:

  Resource                URL
  ----------------------- --------------------------------------
  API root                `http://localhost:8000/`
  Swagger documentation   `http://localhost:8000/docs`
  Health check            `http://localhost:8000/health`
  OpenAPI schema          `http://localhost:8000/openapi.json`

### 3. Install and start the frontend

Open a second terminal:

``` bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

> **Windows note:** If you're using PowerShell and the `cp` command is
> unavailable, use:
>
> ``` powershell
> Copy-Item backend/.env.example backend/.env
> ```

------------------------------------------------------------------------

## Configuration

Create `backend/.env` from `backend/.env.example`.

  -------------------------------------------------------------------------------
  Variable                  Description             Default
  ------------------------- ----------------------- -----------------------------
  `DATABASE_URL`            SQLAlchemy database     `sqlite:///./leadforge.db`
                            connection              

  `ENVIRONMENT`             Application environment `development`

  `PORT`                    Backend port            `8000`

  `GEMINI_API_KEY`          Direct Google Gemini    Empty
                            API key                 

  `OPENROUTER_API_KEY`      OpenRouter API key      Empty

  `GOOGLE_PLACES_API_KEY`   Google Places API key   Empty

  `BACKEND_CORS_ORIGINS`    Allowed frontend        `["http://localhost:3000"]`
                            origins                 
  -------------------------------------------------------------------------------

For the complete environment-variable reference, see
[`ENVIRONMENT_VARIABLES.md`](ENVIRONMENT_VARIABLES.md).

**Keep secrets private:** never commit `.env` files or expose API keys
in frontend code.

------------------------------------------------------------------------

## API reference

The backend exposes REST endpoints for discovery, lead management,
auditing, outreach, and analytics.

  ------------------------------------------------------------------------------------------
  Method                  Endpoint                                   Purpose
  ----------------------- ------------------------------------------ -----------------------
  `GET`                   `/`                                        Root service
                                                                     information

  `GET`                   `/health`                                  Health check

  `POST`                  `/api/v1/discovery/search`                 Discover businesses in
                                                                     a target geography

  `GET`                   `/api/v1/businesses`                       List and filter leads

  `GET`                   `/api/v1/businesses/{id}`                  Retrieve a lead

  `PATCH`                 `/api/v1/businesses/{id}/status`           Update lead status

  `DELETE`                `/api/v1/businesses`                       Delete all businesses

  `DELETE`                `/api/v1/businesses/{id}`                  Delete one business

  `POST`                  `/api/v1/businesses/{id}/generate-pitch`   Generate an outreach
                                                                     draft

  `POST`                  `/api/v1/businesses/{id}/audit`            Run an on-demand
                                                                     website audit

  `GET`                   `/api/v1/analytics`                        Retrieve pipeline
                                                                     analytics
  ------------------------------------------------------------------------------------------

When the backend is running, explore the interactive API documentation
at **http://localhost:8000/docs**.

------------------------------------------------------------------------

## Why LeadForge AI?

  -----------------------------------------------------------------------
  Typical agency workflow             LeadForge approach
  ----------------------------------- -----------------------------------
  Multiple disconnected               Discovery, qualification, and CRM
  lead-generation tools               in one workflow

  Generic databases that overlook     Geographic discovery using
  local businesses                    OpenStreetMap and optional Google
                                      Places enrichment

  Manual checks of every business     Automated technical website audits
  website                             

  Opaque lead-priority decisions      Explainable 0--100 opportunity
                                      score

  Paid email-verification services    In-house DNS MX record checks

  Generic cold-email templates        AI-assisted pitches grounded in
                                      available audit findings

  Separate AI integrations            Unified OpenRouter gateway

  Untracked follow-ups                Lead status tracking and CRM
                                      exports
  -----------------------------------------------------------------------

The goal is not simply to collect more leads. It is to help agencies
identify and prioritize **more relevant opportunities**.

------------------------------------------------------------------------

## Security and responsible outreach

LeadForge AI includes safeguards intended to make its discovery and
outreach workflows more responsible:

-   **SSRF protection:** crawler checks are designed to block private,
    loopback, and metadata IP ranges.
-   **Human review:** generated outreach is a draft; an operator remains
    responsible for reviewing and approving messages.
-   **Sending safeguards:** the project documentation describes daily
    throttles and inter-email jitter delays for sending workflows.
-   **Suppression handling:** a global suppression list is part of the
    documented outreach safeguards.
-   **Privacy and compliance:** the project is designed with India's
    DPDP Act 2023 and CAN-SPAM considerations in mind.

These technical safeguards do not, by themselves, guarantee legal
compliance. Operators are responsible for applicable consent, notice,
opt-out, data-retention, and outreach requirements.

See [`SECURITY_AND_COMPLIANCE.md`](SECURITY_AND_COMPLIANCE.md) for the
detailed policy.

------------------------------------------------------------------------

## Development roadmap

  -----------------------------------------------------------------------
  Phase                   Focus                   Status
  ----------------------- ----------------------- -----------------------
  Phase 1                 Discovery, technical    Complete
                          auditing, opportunity   
                          scoring, AI outreach,   
                          and lead CRM            

  Phase 2                 ARQ + Redis worker      Planned
                          fleet, Gmail OAuth2     
                          sending, throttling,    
                          and suppression list    

  Phase 3                 AI website-demo concept Planned
                          generator and           
                          interactive prospect    
                          previews                

  Phase 4                 Multi-region expansion, Planned
                          advanced analytics, and 
                          A/B testing             
  -----------------------------------------------------------------------

The documented expansion regions include the GCC, Southeast Asia, UK,
Australia, and North America.

See [`DEVELOPMENT_ROADMAP.md`](DEVELOPMENT_ROADMAP.md) for details.

------------------------------------------------------------------------

## Contributing

Contributions and improvements are welcome.

1.  Fork the repository.

2.  Create a feature branch:

    ``` bash
    git checkout -b feature/your-feature
    ```

3.  Commit your changes:

    ``` bash
    git commit -m "feat: add your feature"
    ```

4.  Push your branch:

    ``` bash
    git push origin feature/your-feature
    ```

5.  Open a Pull Request.

Please follow the conventions in `PROJECT_STRUCTURE.md`: keep API
endpoints thin, place business logic in `backend/app/services/`, and use
Pydantic v2 for serialization.

------------------------------------------------------------------------

## License

This project is licensed under the **MIT License**. See the
[`LICENSE`](LICENSE) file for details.

------------------------------------------------------------------------

## Acknowledgements

Built with and powered by:

-   [OpenStreetMap](https://www.openstreetmap.org/) and [Overpass
    API](https://overpass-api.de/) --- geographic business discovery
-   [OpenRouter](https://openrouter.ai/) --- unified AI model gateway
-   [Google PageSpeed
    Insights](https://developers.google.com/speed/pagespeed/insights/)
    --- website performance insights
-   [Next.js](https://nextjs.org/) --- frontend framework
-   [FastAPI](https://fastapi.tiangolo.com/) --- backend framework
-   [Tailwind CSS](https://tailwindcss.com/) --- styling
-   [TanStack](https://tanstack.com/) --- data and table utilities
-   [shadcn/ui](https://ui.shadcn.com/) --- interface components

------------------------------------------------------------------------

::: {align="center"}
### LeadForge AI

**Turn invisible local businesses into your next client opportunity.**

Discover smarter. Qualify with evidence. Reach out with purpose.
:::
