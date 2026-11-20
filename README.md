# LeadForge AI

### Find the businesses the web forgot. Turn opportunity into outreach.

An AI-powered lead discovery and business intelligence platform for web development agencies.

Discover local businesses with missing or broken websites, audit their digital presence, identify opportunities, and generate personalized outreach.

<p align="center">
  <img src="images/Home_Page.png" alt="LeadForge AI Home Page" width="700" />
</p>

<p align="center">
  <em>Figure 1: LeadForge AI home page — live radar and lead discovery interface.</em>
</p>

---
## 🛠️ Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/OpenRouter-7C3AED?style=for-the-badge" />
  <img src="https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Places-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/BeautifulSoup-000000?style=for-the-badge" />
  <img src="https://img.shields.io/badge/PageSpeed_Insights-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" />
  <img src="https://img.shields.io/badge/ARQ-333333?style=for-the-badge" />
</p>

## ✨ Features

- **Business Discovery** — Find local businesses using OpenStreetMap and optional Google Places.
- **Website Auditing** — Detect missing, broken, or outdated websites and analyze performance, SEO, and mobile responsiveness.
- **Opportunity Scoring** — Rank leads using a transparent score from 0–100.
- **Contact Discovery** — Extract publicly available email addresses and check domain MX records.
- **AI Outreach Studio** — Generate personalized sales emails using OpenRouter.
- **Lead CRM** — Manage prospects, track statuses, and export lead data.
- **Analytics Dashboard** — Monitor leads, conversion progress, and AI usage.

<p align="center">
  <img src="images/AI_Pitch.png" alt="AI Pitch Generator" width="700" />
</p>

<p align="center">
  <em>Figure 3: AI Outreach Studio — generate personalized, evidence-based sales emails for each lead.</em>
</p>

## ⚙️ How It Works

<p align="center">
  <img src="images/Finding_Lead.png" alt="Finding Leads" width="700" />
</p>

<p align="center">
  <em>Figure 2: Geographic lead discovery — scan a city and radius to surface businesses with digital gaps.</em>
</p>

1. Select a target location.
2. Discover local businesses.
3. Audit their websites and digital presence.
4. Find publicly available contact details.
5. Calculate opportunity scores.
6. Generate personalized outreach drafts.
7. Review and manage leads through the CRM.


## 🧠 Opportunity Scoring

Each lead receives a score out of 100:

| Factor | Weight |
|---|---:|
| Website Deficit | 35 |
| Commercial Viability | 30 |
| Contact Accessibility | 20 |
| Agency Fit | 15 |
| **Total** | **100** |

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/modassirprog/LeadForge_AI.git
cd LeadForge_AI
```

### 2. Set up the backend

```powershell
pip install -r backend/requirements.txt
Copy-Item backend/.env.example backend/.env
```

Add your API keys to `backend/.env`, then run:

```bash
python -m uvicorn backend.app.main:app --reload --port 8000
```

### 3. Set up the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**.

## 🔑 Environment Variables

Configure these in `backend/.env`:

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API |
| `OPENROUTER_API_KEY` | AI outreach generation |
| `GOOGLE_PLACES_API_KEY` | Business data enrichment |
| `DATABASE_URL` | Database connection |
| `BACKEND_CORS_ORIGINS` | Allowed frontend origins |

See `backend/.env.example` for the configuration template.

**Never commit your `.env` file or expose API keys publicly.**

## 📁 Project Structure

```text
LeadForge_AI/
├── frontend/          # Next.js application
├── backend/
│   ├── app/
│   │   ├── api/       # API endpoints
│   │   ├── core/      # Configuration and database
│   │   ├── models/    # Database models
│   │   ├── schemas/   # Pydantic schemas
│   │   └── services/  # Business logic
│   └── main.py
├── .gitignore
├── README.md
└── backend/.env.example
```

## 🔒 Security & Responsible Use

- Website crawler includes SSRF protections.
- Contact information is sourced from publicly available pages.
- AI-generated outreach requires human review.
- Domain MX checks do not guarantee mailbox existence.
- Users are responsible for applicable privacy and outreach laws.


## 🗺️ Roadmap

- [x] Business discovery and website auditing
- [x] Opportunity scoring
- [x] AI-powered outreach generation
- [x] Lead management dashboard
- [ ] Background job processing
- [ ] Gmail OAuth integration
- [ ] AI-generated website demos
- [ ] Advanced analytics and A/B testing

## 📄 License

Released under the [MIT License](LICENSE).

---

<p align="center">
  <strong>LeadForge AI</strong><br/>
  Turn invisible local businesses into your next client opportunity.<br/>
  <i>Discover smarter. Qualify with evidence. Reach out with purpose.</i>
</p>
