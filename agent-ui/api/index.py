import os
import uuid
import json
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Header, Response
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api.database import init_db, get_db, User, Session as DBSession, Message, Memo, ToolCall

# Get Client ID from environment variables
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLAlchemy database tables
    init_db()
    yield

app = FastAPI(title="Antigravity Web Wrapper API", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Google ID Token Validation
def verify_google_token(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        if not GOOGLE_CLIENT_ID:
            return {"sub": "mock-google-id", "email": "mock@example.com"}
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = authorization.split(" ")[1]
    
    if token == "mock-token" or not GOOGLE_CLIENT_ID:
        return {"sub": "mock-google-id", "email": "mock@example.com"}
        
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        return idinfo
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid ID Token: {str(e)}")

# Dependency to get current user record
def get_current_user(idinfo: dict = Depends(verify_google_token), db: Session = Depends(get_db)) -> User:
    google_id = idinfo["sub"]
    email = idinfo.get("email")
    
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = User(google_id=google_id, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

# Configuration Endpoint
@app.get("/api/config")
def get_config():
    return {"google_client_id": GOOGLE_CLIENT_ID}

# --- Sessions Endpoints ---

class SessionCreate(BaseModel):
    title: str

@app.get("/api/sessions")
def list_sessions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(DBSession).filter(DBSession.user_id == user.id).order_by(DBSession.updated_at.desc()).all()
    return [{"id": str(s.id), "title": s.title, "created_at": s.created_at, "updated_at": s.updated_at} for s in sessions]

@app.post("/api/sessions")
def create_session(session_data: SessionCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = DBSession(user_id=user.id, title=session_data.title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"id": str(session.id), "title": session.title}

@app.delete("/api/sessions/{session_id}")
def delete_session(session_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        session_uuid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID format")
        
    session = db.query(DBSession).filter(DBSession.id == session_uuid, DBSession.user_id == user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    db.delete(session)
    db.commit()
    return {"status": "success"}

@app.get("/api/sessions/{session_id}/messages")
def get_session_messages(session_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        session_uuid = uuid.UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID format")
        
    session = db.query(DBSession).filter(DBSession.id == session_uuid, DBSession.user_id == user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    messages = db.query(Message).filter(Message.session_id == session_uuid).order_by(Message.created_at.asc()).all()
    return [{"id": str(m.id), "role": m.role, "content": m.content, "created_at": m.created_at} for m in messages]

# --- Memos Endpoints ---

@app.get("/api/memos")
def list_memos(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    memos = db.query(Memo).filter(Memo.user_id == user.id).order_by(Memo.updated_at.desc()).all()
    return [{"id": str(m.id), "title": m.title, "content": m.content, "updated_at": m.updated_at} for m in memos]

# --- Chat SSE Stream Endpoint ---

class ChatRequest(BaseModel):
    session_id: str
    message: str

@app.post("/api/chat")
async def chat_endpoint(
    req: ChatRequest,
    user: User = Depends(get_current_user),
    x_llm_api_key: Optional[str] = Header(None),
    x_mcp_token: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    if not x_llm_api_key:
        raise HTTPException(status_code=400, detail="Missing X-LLM-API-Key header")
    if not x_mcp_token:
        raise HTTPException(status_code=400, detail="Missing X-MCP-Token header")
        
    try:
        session_uuid = uuid.UUID(req.session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID format")
        
    session = db.query(DBSession).filter(DBSession.id == session_uuid, DBSession.user_id == user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    async def sse_chat_generator():
        past_db_messages = db.query(Message).filter(Message.session_id == session_uuid).order_by(Message.created_at.asc()).all()
        history_context = ""
        for msg in past_db_messages:
            role = "User" if msg.role == "user" else "Assistant"
            history_context += f"{role}: {msg.content}\n\n"
            
        prompt = req.message
        if history_context:
            prompt = (
                "Here is the conversation history so far for your reference:\n"
                f"{history_context}"
                "Please respond to the following user message based on the history above if needed:\n"
                f"User: {req.message}"
            )
            
        # Write user message to DB
        user_msg = Message(session_id=session_uuid, role="user", content=req.message)
        db.add(user_msg)
        session.updated_at = datetime.utcnow()
        db.commit()
        
        yield f"data: {json.dumps({'type': 'status', 'status': 'User message recorded'})}\n\n"
        
        from api.agent_wrapper import initialize_agent
        agent = initialize_agent(x_llm_api_key, x_mcp_token, user.id, session_uuid, db)
        
        full_response_text = ""
        try:
            async with agent:
                yield f"data: {json.dumps({'type': 'status', 'status': 'Agent initialized'})}\n\n"
                response = await agent.chat(prompt)
                
                from google.antigravity import types
                async for chunk in response.chunks:
                    if isinstance(chunk, types.Thought):
                        yield f"data: {json.dumps({'type': 'thought', 'text': chunk.text})}\n\n"
                    elif isinstance(chunk, types.Text):
                        full_response_text += chunk.text
                        yield f"data: {json.dumps({'type': 'text', 'text': chunk.text})}\n\n"
                    elif isinstance(chunk, types.ToolCall):
                        yield f"data: {json.dumps({'type': 'tool_call', 'name': chunk.name, 'arguments': chunk.arguments})}\n\n"
                        
            # Write model response to DB
            if full_response_text:
                model_msg = Message(session_id=session_uuid, role="model", content=full_response_text)
                db.add(model_msg)
                session.updated_at = datetime.utcnow()
                db.commit()
            
            yield f"data: {json.dumps({'type': 'status', 'status': 'Completed'})}\n\n"
        except Exception as e:
            db.rollback()
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

    return StreamingResponse(sse_chat_generator(), media_type="text/event-stream")
