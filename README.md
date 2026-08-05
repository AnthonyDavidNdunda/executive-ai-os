# Executive AI Operating System (EAIOS)

An AI-powered executive decision-support platform that combines real-time KPI analytics, conversational business intelligence, and Claude AI to help leadership teams monitor performance and make data-driven decisions.

**Live Demo:** [executive-ai-os.vercel.app](https://executive-ai-os.vercel.app)  
**API Docs:** [executive-ai-os.onrender.com/docs](https://executive-ai-os.onrender.com/docs)

        Note: the backend runs on Render's free tier and spins down after ~15 minutes of inactivity. The first request may take 30-60 seconds while
        the service wakes.

---

## Overview

The platform lets users upload financial data and supporting documents, then query both conversationally or generative structured executive reports. It is built
to demonstrate full-stack-engineering, applied AI, and the kind of correctness work that separates a working demo from something trustworthy.

Users can:
    - Upload KPI data via CSV and view live dashboards
    - Upload PDFs (policies, reports, contracts) into a searchable document library
    - Ask business questions, receive answers grounded in both KPI data and documents
      with source citations
    - Generate executive reports: weekly summaries, board briefs, and risk assessments

---

## Features

### Executive Dashboard
KPI summary cards, revenue vs expense trends, and operating margin charts, all driven from live PostGreSQL data. Handles backend cold starts with 
exponential-backoff retry and honest loading states rather than failing silently.

### AI Executive Copilot
Conversational interface backed by Anthropic's Claude. Every response is grounded in the current KPI context and any relevant uploaded documents, with
the source documents surfaced as citations beneath the answer.

### RAG Pipeline
PDFs are extracted with pdfplumber, chunked with overlap, embedded via Voyage AI, and stored as vectors in PostgreSQL using pgvector. Queries are 
embedded and matched by cosine similarity, with a 0.4 similarity threshold discarding weak matches before they reach the prompt -- this prevents the 
model from citing documents it did not meaningfully draw on.

### Report Generation
Three report types, each with its own system prompt, section structure, and retrieval query so that a risk assessment surfaces different source material
than a weekly summary

### Numerical Reliability
LLMs are unreliable at arithmetic and may fabricate a figure rather than leave a sentence unfinished. Hence, all derived metrics -- month-over-month deltas,
basis-point changes, H1/H2 splits, cash conversion ratios -- are computed in Python and passed into the prompt pre-calculated. The system prompt prohibits arithmetic outright

This measurably reduced fabricated figures but it does not eliminate them. Generated reports carry a visible review notice, and the limitation is documented
rather than hidden.
---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui |
| Charts | Recharts |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL + pgvector (Docker locally, Neon in production) |
| LLM | Anthropic Claude |
| Embeddings | Voyage AI (voyage-3, 1024 dimensions) |
| Document processing | pdfplumber |
| Auth | JWT via python-jose and passlib |
| Data Processing | Pandas |
| Deployment | Vercel (frontend), Render (backend), Neon (database) |
| DevOps | Docker, Git, GitHub |

---

## Architecture

```
executive-ai-os/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx             # Executive dashboard
│       │   ├── copilot/             # AI chat with citations
│       │   ├── reports/             # Report generation and library
│       │   ├── uploads/             # CSV + PDF upload, document library
│       │   ├── forecasting/         # Month 3
│       │   └── alerts/              # Month 3
│       ├── components/              # Sidebar, Topbar, shadcn/ui
│       └── services/                # Axios API client
│
├── backend/
│   ├── app/
│   │   ├── api/                     # auth, kpis, chat, documents, reports
│   │   ├── ai/
│   │   │   ├── chat_service.py      # Context assembly, Claude calls
│   │   │   ├── embedding_service.py # PDF extraction, chunking, embeddings
│   │   │   ├── retrieval_service.py # Vector search with threshold
│   │   │   └── report_service.py    # Report types and generation
│   │   ├── core/                    # Config, JWT, security
│   │   ├── db/                      # Engine, session
│   │   ├── models/                  # User, KPI, ChatMessage, Document, Report
│   │   ├── schemas/                 # Pydantic models
│   │   └── services/                # KPI parsing, derived metrics
│   └── main.py
│
├── infrastructure/docker/           # Local PostgreSQL
├── datasets/                        # Sample KPI data
└── docs/decisions.md                # Architecture decision log
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
Enable pgvector on the database 
```sql
CREATE EXTENSION IF NOT EXIST vector;
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
VOYAGE_API_KEY=your_key_here
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

### Documents
| Method | Endpoint | Description
|---|---|---|
| POST | /documents/upload | Upload your pdf documents |
| GET | /documents/ | Get any documents stored |
| DELETE | /documents/{id} | delete document by id |

### Reports
| Method | Endpoint | Description
|---|---|---|
| POST | /reports/type | Get the report type (risk assessment, weekly etc) |
| POST | /reports/generate | Generate reports |
| GET | /reports/ | Get reports |
| DELETE | /reports/{id} | Delete reports by id |
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
- **Month 2 ✅** — RAG over documents, PDF upload, semantic search, pgvector
- **Month 3** — Financial forecasting, anomaly detection, LangGraph agents
- **Month 4** — Azure enterprise migration, Azure AD SSO, board-ready reporting

---

### Engineering Notes
Decisions worth calling out, with fuller context in docs/decisions.md:

Retrieval threshold. Without a minimum similarity, vector search always returns the top k chunks regardless of relevance — so reports cited documents they had not used. Measured on the current corpus: a relevant query scores ~0.58, an irrelevant one ~0.006. The 0.4 cutoff sits between them and will need retuning as the library grows and scores cluster.

Voyage AI v0.5.0. Use the module-level voyageai.get_embedding(); the Client class raises 'TextDoc' object is not callable in this version. The deprecation warning is expected.

Neon SSL. Pass sslmode via connect_args rather than appending it to the connection string, and set pool_pre_ping=True with pool_recycle=300 to survive Neon's idle connection closes.

Exception handling. Early versions swallowed retrieval errors silently, which made failures look like "no documents found" and cost real debugging time. Retrieval and generation paths now log tracebacks.

## Resume Bullet

> Built an AI-powered executive operating system integrating financial KPI analytics, conversational AI (Anthropic Claude), and a real-time dashboard using Next.js, FastAPI, and PostgreSQL. Deployed on Vercel, Render, and Neon with production-ready JWT authentication and a CSV ingestion pipeline.

---

## Author

**Anthony Ndunda**  with assistance from Claude 
[GitHub](https://github.com/AnthonyDavidNdunda)