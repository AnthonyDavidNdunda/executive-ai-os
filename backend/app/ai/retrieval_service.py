import voyageai
from sqlalchemy.orm import Session
from app.core.config import settings
from sqlalchemy import text

voyageai.api_key = settings.VOYAGE_API_KEY

def search_documents(query: str, db: Session, top_k: int = 5) -> list[str]:
    #Get embedding for the query
    query_embedding = voyageai.get_embedding(query, model="voyage-3", input_type="query")
    
    #Search for similar chunks using pgvector cosine similarity
    chunks = db.execute(
        text("""
        SELECT chunk_text, 1 - (embedding <=> :embedding) AS similarity
        FROM document_chunks
        ORDER BY embedding <=> :embedding
        LIMIT :top_k
        """),
        {"embedding": str(query_embedding), "top_k": top_k}
    ).fetchall()
    
    return [chunk[0] for chunk in chunks]