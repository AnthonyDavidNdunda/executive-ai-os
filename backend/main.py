from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.api import auth
from app.api import kpis
from app.api import chat
from app.models import document
from app.api import documents

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Executive AI OS", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://executive-ai-os.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(kpis.router)
app.include_router(chat.router)
app.include_router(documents.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "executive-ai-os"}