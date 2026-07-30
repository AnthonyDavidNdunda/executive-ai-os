import voyageai
from sqlalchemy.orm import Session
from app.core.config import settings
from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

voyageai.api_key = settings.VOYAGE_API_KEY

def search_documents(query: str, db: Session, top_k: int = 5, min_similarity: float = 0.4) -> list[str]:
    #Get embedding for the query
    
    try:
        
        query_embedding = voyageai.get_embedding(query, model="voyage-3", input_type="query")
        #Search for similar chunks using pgvector cosine similarity
        chunks = db.execute(
            text("""
            SELECT dc.chunk_text, d.filename, 1 - (dc.embedding <=> :embedding) AS similarity
            FROM document_chunks dc
            JOIN documents d ON dc.document_id = d.id
            ORDER BY dc.embedding <=> :embedding
            LIMIT :top_k
            """),
            {"embedding": str(query_embedding), "top_k": top_k}
        ).fetchall()
        
        return [
            {"chunk_text": chunk[0], "filename": chunk[1], "similarity": float(chunk[2])}
            for chunk in chunks
            if float(chunk[2]) >= min_similarity
        ]
    except Exception as e:
        db.rollback()  # Rollback the session in case of an error
        logger.exception("Document search failed: %s", str(e))
        return[]