import os
import uuid
from datetime import datetime
from google.antigravity import LocalAgentConfig, Agent, policy, types
from google.antigravity.types import McpStdioServer
from google.antigravity.hooks import hooks

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORKSPACE_DIR = os.path.dirname(BASE_DIR)

def load_canvas_skill_guide():
    skill_path = os.path.join(WORKSPACE_DIR, ".agents", "skills", "canvas-lms", "SKILL.md")
    if os.path.exists(skill_path):
        with open(skill_path, "r", encoding="utf-8") as f:
            return f.read()
    return "Canvas LMS skill guide not found."

def get_memo_tools(user_id, db):
    def write_memo(title: str, content: str) -> str:
        """Saves or updates a memo with the given title and content.

        Args:
            title: The unique title of the memo.
            content: The text content of the memo.
        """
        from api.database import Memo
        from sqlalchemy import and_
        
        memo = db.query(Memo).filter(and_(Memo.user_id == user_id, Memo.title == title)).first()
        if memo:
            memo.content = content
            memo.updated_at = datetime.utcnow()
        else:
            memo = Memo(user_id=user_id, title=title, content=content)
            db.add(memo)
        
        try:
            db.commit()
            return f"Successfully saved memo '{title}'."
        except Exception as e:
            db.rollback()
            return f"Failed to save memo '{title}': {str(e)}"

    def read_memo(title: str) -> str:
        """Reads the content of a memo by its title.

        Args:
            title: The title of the memo to read.
        """
        from api.database import Memo
        from sqlalchemy import and_
        
        memo = db.query(Memo).filter(and_(Memo.user_id == user_id, Memo.title == title)).first()
        if memo:
            return memo.content
        return f"Memo '{title}' not found."

    def list_memos() -> list[str]:
        """Lists the titles of all saved memos for the current user."""
        from api.database import Memo
        
        memos = db.query(Memo).filter(Memo.user_id == user_id).all()
        return [m.title for m in memos]

    return [write_memo, read_memo, list_memos]

def initialize_agent(api_key: str, mcp_token: str, user_id, session_id, db) -> Agent:
    skill_content = load_canvas_skill_guide()
    
    # Enforce strict prompt-level constraints restricting operations to Canvas LMS.
    system_instructions = (
        "You are an AI assistant specialized in Canvas LMS.\n"
        "CRITICAL: You are only allowed to answer questions and execute commands related to Canvas LMS. "
        "For any requests, questions, or commands that are NOT related to Canvas LMS, you must refuse and state "
        "that you can only assist with Canvas LMS operations. Do not write code, write poetry, answer general questions, "
        "or perform any other tasks unrelated to Canvas LMS.\n\n"
        "Here is the Canvas LMS Skill Guide:\n"
        f"{skill_content}"
    )

    # Configure Stdio MCP Server for Canvas LMS
    mcp_index_js = os.path.join(WORKSPACE_DIR, "canvas-lms-mcp", "index.js")
    canvas_url = os.getenv("CANVAS_BASE_URL", "https://nu.instructure.com/")
    
    mcp_config = McpStdioServer(
        name="canvas-lms-mcp",
        command="node",
        args=[mcp_index_js],
        env={
            "CANVAS_API_TOKEN": mcp_token,
            "CANVAS_BASE_URL": canvas_url,
        }
    )

    # Hooks to log tool executions to the database
    @hooks.pre_tool_call_decide
    async def pre_tool(data: types.ToolCall) -> types.HookResult:
        try:
            from api.database import ToolCall
            record_id = None
            if data.id:
                try:
                    record_id = uuid.UUID(data.id)
                except ValueError:
                    pass
            if not record_id:
                record_id = uuid.uuid4()

            record = ToolCall(
                id=record_id,
                session_id=session_id,
                tool_name=data.name,
                status="running",
                arguments=data.arguments,
                result=None
            )
            db.add(record)
            db.commit()
        except Exception as e:
            print("DB logging error in pre_tool:", e)
        return types.HookResult(allow=True)

    @hooks.post_tool_call
    async def post_tool(data: types.ToolResult):
        try:
            from api.database import ToolCall
            record_id = None
            if data.id:
                try:
                    record_id = uuid.UUID(data.id)
                except ValueError:
                    pass
            if record_id:
                record = db.query(ToolCall).filter(ToolCall.id == record_id).first()
                if record:
                    record.status = "success" if not data.error else "failed"
                    record.result = {
                        "result": data.result,
                        "error": data.error
                    }
                    db.commit()
        except Exception as e:
            print("DB logging error in post_tool:", e)

    # Configure the Antigravity Agent
    save_dir = f"/tmp/antigravity_{session_id}"
    os.makedirs(save_dir, exist_ok=True)

    config = LocalAgentConfig(
        api_key=api_key,
        system_instructions=system_instructions,
        tools=get_memo_tools(user_id, db),
        mcp_servers=[mcp_config],
        policies=[policy.allow_all()],  # Allows MCP tools to run
        workspaces=[WORKSPACE_DIR],
        save_dir=save_dir,
        conversation_id=str(session_id),
        hooks=[pre_tool, post_tool]
    )

    return Agent(config=config)
