# Executive AI Operating System (EAIOS)

An AI-powered executive decision-support platform that combines real-time KPI analytics, conversational business intelligence, and Claude AI to help leadership teams monitor performance and make data-driven decisions.

**Live Demo:** [executive-ai-os.vercel.app](https://executive-ai-os.vercel.app)  
**API Docs:** [executive-ai-os.onrender.com/docs](https://executive-ai-os.onrender.com/docs)

---

## Overview

This project demonstrates full-stack engineering, AI integration, and enterprise architecture across a production-deployed application. It is positioned as a portfolio centerpiece showing the ability to bridge software engineering, AI systems, business intelligence, and executive analytics.

The platform enables users to:

- Upload financial and operational KPI data via CSV
- View executive dashboards with live charts and trend analysis
- Ask business questions conversationally and receive AI-generated insights
- Track chat history and revisit past analyses

---

## Features

### Executive Dashboard
- KPI summary cards (Revenue, EBITDA, Expenses, Cash Flow)
- Revenue vs Expenses trend chart
- Operating Margin trend chart
- Data sourced live from PostgreSQL

### AI Executive Copilot
- Conversational interface powered by Anthropic Claude
- KPI-aware prompting — AI has full context of your financial data
- Executive-grade responses with strategic analysis and recommendations
- Suggested prompts for common business questions
- Chat history persisted in PostgreSQL
- Markdown rendering for structured AI responses

### Data Uploads
- CSV upload with validation
- Supports date, revenue, expenses, ebitda, cash_flow columns
- Ingestion summary with record count
- Format guide built into the UI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui |
| Charts | Recharts |
| Backend | FastAPI, SQLAlchemy, Pydantic, Alembic |
| Database | PostgreSQL (Docker locally, Neon in production) |
| AI | Anthropic Claude (claude-sonnet-4-5) |
| Auth | JWT via python-jose and passlib |
| Data Processing | Pandas |
| Deployment | Vercel (frontend), Render (backend), Neon (database) |
| DevOps | Docker, Git, GitHub |

---

## Architecture

```
executive-ai-os/
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── page.tsx       # Executive dashboard
│   │   │   ├── copilot/       # AI chat interface
│   │   │   ├── uploads/       # CSV upload page
│   │   │   ├── forecasting/   # Forecasting (Month 2)
│   │   │   └── alerts/        # Alerts (Month 2)
│   │   ├── components/        # Sidebar, Topbar, UI components
│   │   └── services/          # Axios API client
│
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── api/               # Route handlers (auth, kpis, chat)
│   │   ├── ai/                # Claude AI service and prompting
│   │   ├── core/              # Config, JWT, security
│   │   ├── db/                # SQLAlchemy engine and session
│   │   ├── models/            # ORM models (User, KPI, ChatMessage)
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   └── services/          # Business logic (KPI parsing)
│   └── main.py                # FastAPI entry point
│
├── infrastructure/
│   └── docker/
│       └── docker-compose.yml # Local PostgreSQL
│
├── datasets/
│   └── sample_kpis.csv        # Sample financial data
│
└── docs/
    └── decisions.md           # Architecture decision log
```

---

## Local Development

### Prerequisites

- Node.js 20+
- Python 3.12+
- Docker Desktop

### 1. Clone the repo

```bash
git clone https://github.com/AnthonyDavidNdunda/executive-ai-os.git
cd executive-ai-os
```

### 2. Start the database

```bash
cd infrastructure/docker
docker compose up -d
```

### 3. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
DATABASE_URL=postgresql://admin:password@localhost:5432/executive_ai_os
ANTHROPIC_API_KEY=your_key_here
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Start the backend:

```bash
uvicorn main:app --reload
```

### 4. Set up the frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

### 5. Upload sample data

Visit `http://localhost:3000/uploads` and upload `datasets/sample_kpis.csv`.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/signup | Register a new user |
| POST | /auth/login | Login and receive JWT token |
| GET | /auth/me | Get current user |

### KPIs
| Method | Endpoint | Description |
|---|---|---|
| POST | /kpis/upload | Upload CSV file |
| GET | /kpis/summary | Get aggregated KPI summary |
| GET | /kpis/trends | Get monthly KPI trend data |

### Chat
| Method | Endpoint | Description |
|---|---|---|
| POST | /chat/message | Send message to AI copilot |
| GET | /chat/history | Retrieve chat history |

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | executive-ai-os.vercel.app |
| Backend | Render | executive-ai-os.onrender.com |
| Database | Neon | Managed PostgreSQL |

---

## Roadmap

- **Month 1 ✅** — Foundation, KPI dashboard, AI copilot, deployment
- **Month 2** — RAG over documents, PDF upload, semantic search, pgvector
- **Month 3** — Financial forecasting, anomaly detection, LangGraph agents
- **Month 4** — Azure enterprise migration, Azure AD SSO, board-ready reporting

---

## Resume Bullet

> Built an AI-powered executive operating system integrating financial KPI analytics, conversational AI (Anthropic Claude), and a real-time dashboard using Next.js, FastAPI, and PostgreSQL. Deployed on Vercel, Render, and Neon with production-ready JWT authentication and a CSV ingestion pipeline.

---

## Author

**Anthony Ndunda**  with assistance from Claude Sonnet 4.8
[GitHub](https://github.com/AnthonyDavidNdunda)