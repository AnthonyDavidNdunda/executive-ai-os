import voyageai
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.document import DocumentChunk

vo = voyageai.Client(api_key=settings.VOYAGE_API_KEY)

def search_documents(query: str, db: Session, top_k: int = 5) -> list[str]:
    #Get embedding for the query
    result = vo.embed([query], model="voyage-3")
    query_embedding = result.embeddings[0]
    
    #Search for similar chunks using pgvector cosine similarity
    chunks = db.execute(
        """
        SELECT chunk_text, 1 - (embedding <=> :embedding) AS similarity
        FROM document_chunks
        ORDER BY embedding <=> :embedding
        LIMIT :top_k
        """,
        {"embedding": str(query_embedding), "top_k": top_k}
    ).fetchall()
    
    return [chunk[0] for chunk in chunks]