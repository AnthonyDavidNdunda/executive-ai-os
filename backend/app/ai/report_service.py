import json
import logging
import anthropic
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.report import Report
from app.ai.chat_service import build_kpi_context
from app.ai.retrieval_service import search_documents

logger = logging.getLogger(__name__)
client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

REPORT_TYPES = {
    "weekly_summary": {
        "title": "Weekly Executive Summary",
        "retrieval_query": "performance summary operational highlights",
        "instructions": """Produce a weekly executive summary with these sections: 
        ## Headline
        One sentence capturing the single most important thing leadership should know.
        
        ## Performance Snapshot
        Key metrics with period-over-period movement. Use a table.
        
        ## What changed
        The two or three most significant movements and what drove them.
        
        ## Watch Items
        Anything trending in a concerning direction, with the specific number that makes it concerning.""",
    },
    
    "board_brief": {
        "title": "Broad Brief",
        "retrieval_query": "strategy governance financial position outlook",
        "instructions": """Produce a board-ready brief with these sections: 
        ## Executive Summary
        Three to four sentences. Assume the reader has five minutes.
        
        ## Financial Position
        Revenue, EBITDA, margins and cash flow with full-period context. Use a table.
        
        ## Strategic Observations
        What the trend lines suggest about the business, not just what they show.
        
        ## Decisions Required
        Anything the board needs to weigh in on, or "None at this time" if the data doesn't support one.""",
    },
    
    "risk_assessment": {
        "title": "Risk Assessment",
        "retrieval_query": "risk exposure compliance policy obligations",
        "instructions": """Produce a risk assessment with these sections:
        ## Risk Summary
        Overall posture in two or more sentences.
        
        
        ## Identified Risks
        For each: the risk, the evidence in the data, and severity (High/Medium/Low). Use a table.
        
        ## Mitigation Recommendations
        Concrete actiosn tied to specific risks.
        
        Only flag risks that the data actually supports. Do not invent risks to fill space.""",  
    },
}

def generate_report(report_type: str, db: Session) -> Report:
    if report_type not in REPORT_TYPES:
        raise ValueError(f"Unknown report type: {report_type}")
    
    config = REPORT_TYPES[report_type]
    kpi_context = build_kpi_context(db)
    
    doc_context = ""
    sources = []
    try: 
        chunks = search_documents(config["retrieval_query"], db, top_k=5)
        if chunks:
            doc_context = "\n\nSupporting documents:\n" + "\n\n".join(
                f"[Source: {c['filename']}]\n{c['chunk_text']}" for c in chunks
            )
            sources = sorted({c["filename"] for c in chunks})
    except Exception:
        logger.exception("Document retrieval failed during report generation")
        
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=2048,
        system=f"""You are an executive financial analyst preparing a formal report for senior leadership.
        
        {config['instructions']}
        
        Rules:
        - Ground every claim in the provided data. Cite specific numbers.
        - If the data does not support a section, say so plainly rather than speculating.
        - Write for executives: direct, concise, no hedging.
        - Use markdown formatting.
        
        NUMERICAL ACCURACY -- This overrides all other instructions: 
        - Do not perform arithmetic of any kind. This includes subtracting,
        dividing, or comparing two figures that were provided to you.
        Deriving a new number from provided numbers is still prohibited.
        - State only figures that appear verbatim in the context.
        - If you want to express a relationship between two numbers and that
        relationship is not itself provided, describe it in words with no figure.
        - Before writing any number, confirm it appears in the context above.
        If it does not, remove it.
        - Do not label a figure as "implied," "approximately," or "estimated" to
        work around this rule. Omit it instead.
        """,
        
        messages=[
            {
                "role": "user",
                "content": f"KPI Data:\n{kpi_context}{doc_context}\n\nGenerate the report.",
            }
        ],
    )
    
    report = Report(
        report_type= report_type,
        title = config["title"],
        content = response.content[0].text,
        sources = json.dumps(sources) if sources else None,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report