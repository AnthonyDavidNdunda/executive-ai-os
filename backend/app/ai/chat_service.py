import anthropic
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.chat import ChatMessage
from app.services.kpi_service import get_summary, get_trends
from app.ai.retrieval_service import search_documents

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

def build_kpi_context(db: Session) -> str: 
    summary = get_summary(db)
    trends = get_trends(db)

    if not summary or "total_revenue" not in summary:
        return "No KPI data is currently available."
    
    trends_text = "\n".join([
        f"- {t['date']}: Revenue ${t['revenue']:,.0f}, Expenses ${t['expenses']:,.0f}, "
        f"EBITDA ${t['ebitda']:,.0f}, Margin {t['operating_margin']}%, Cash Flow ${t['cash_flow']:,.0f}"
        for t in trends
    ])
    
    context = f"""

Current KPI Summary:
- Total Revenue: ${summary['total_revenue']:,.0f}
- Total EBITDA: ${summary['total_ebitda']:,.0f}
- Total Expenses: ${summary['total_expenses']:,.0f}
- Total Cash Flow: ${summary['total_cash_flow']:,.0f}
- Average Operating Margin: ${summary['average_operating_margin']}%
- Data Period: ${summary['record_count']} months

Monthly Breakdown:
{trends_text}
"""
    return context.strip()


def ask_ai(message: str, db: Session) -> str:
    kpi_context = build_kpi_context(db)

    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=16000,
        system="""You are an executive financial analyst advising senior leadership.
        Your responses should be:
        - Concise and analytical
        - Strategic and forward-looking
        - Executive-friendly (no jargon)
        - Data-driven base on the KPI context provided

        Always reference specific numbers from the context when relevant.""",
        messages=[
            {
                "role": "user",
                "content": f"KPI Context:\n{kpi_context}\n\nQuestion: {message}"
            }
        ]

    )

    return response.content[0].text

def save_message(user_message: str, ai_response: str, db: Session) -> ChatMessage:
    chat = ChatMessage(
        user_message=user_message,
        ai_response=ai_response
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    
    return chat


def ask_ai(message: str, db: Session) -> str:
    kpi_context = build_kpi_context(db)
    
    #Search for relevant document chunks
    doc_chunks = search_documents(message, db)
    doc_context = ""
    if doc_chunks:
        doc_context = "\n\nRelevant Document Context:\n" + "\n\n".join(doc_chunks)
        
    response = client.message.create(
        model = "claude-opus-4-7",
        max_tokens = 16000,
        system="""You are an executive financial analyst advising senior leadership.
        Your responses should be: 
        - Concise and analytical
        - Strategic and forward-looking
        - Executive-friendly (no jargon)
        - Data-driven base on the KPI context provided

        Always reference specific numbers from the context when relevant.
        If the document is provided, incorporate insights from it alongside the KPI data.""",
        
        messages=[
            {
                "role": "user",
                "content": f"KPI Context:\n{kpi_context}{doc_context}\n\nQuestion: {message}"
            }
        ]
    ) 
    
    return response.context[0].text
