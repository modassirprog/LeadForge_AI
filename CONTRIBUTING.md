# Contributing to LeadForge AI

Thank you for your interest in contributing to LeadForge AI! This is an agency-focused lead discovery and outreach platform. Below are the guidelines for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Security](#security)
- [License](#license)

## 🤝 Code of Conduct

By contributing, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please be respectful and constructive in all interactions.

## 🛠️ How to Contribute

1. **Fork the repository** on GitHub.
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and test them locally.
4. **Commit with a meaningful message** (see [Commit Message Convention](#commit-message-convention)).
5. **Push to your fork** and open a Pull Request against `main`.

## 💻 Development Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### Backend (FastAPI)

```bash
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys
python -m uvicorn backend.app.main:app --reload --port 8000
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

## 📏 Coding Standards

### Backend (Python)
- Follow [PEP 8](https://pep8.org/) with a 100-character line limit.
- Use [Pydantic v2](https://docs.pydantic.dev/) for all request/response DTOs.
- Keep FastAPI route handlers thin; business logic lives in `backend/app/services/`.
- All DB calls use async SQLAlchemy; all HTTP calls use `httpx.AsyncClient`.
- Run `ruff check backend/` before committing.

### Frontend (TypeScript / Next.js)
- Use TypeScript strict mode.
- Components live in `frontend/src/components/`; pages in `frontend/src/app/`.
- Use Tailwind CSS for styling; shadcn/ui for UI primitives.
- Run `npm run lint` before committing.

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short summary>

<optional body>
<optional footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`.

Example:
```
feat: add DNS MX email verification endpoint

Adds async DNS MX record lookup to the contact discovery pipeline.
Closes #42
```

## 🔀 Pull Request Process

1. Ensure your branch is up to date with `main`.
2. Run linting and tests locally.
3. Open a PR with a clear title and description.
4. Link any related issues (e.g. `Closes #12`).
5. Request review from a maintainer.
6. After approval, squash and merge.

## 🔒 Security

- **Never commit secrets.** API keys, OAuth credentials, and database URLs go in environment variables only (`.env` is gitignored).
- If you discover a security vulnerability, please disclose it responsibly by emailing `security@leadforge.ai` rather than opening a public issue.
- All crawlers must respect SSRF safeguards and `robots.txt`.

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
