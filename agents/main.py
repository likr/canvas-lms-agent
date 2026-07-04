import asyncio
import os
import logging
from dotenv import load_dotenv
from google.antigravity import LocalAgentConfig, Agent, policy
from google.antigravity.types import McpStdioServer

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

async def main():
    # Load environment variables from .env
    load_dotenv()
    
    # Get Canvas variables
    canvas_token = os.getenv("CANVAS_API_TOKEN")
    canvas_url = os.getenv("CANVAS_BASE_URL", "https://canvas.instructure.com")
    
    # Configure the MCP server
    mcp_config = McpStdioServer(
        name="canvas-lms",
        command="npm",
        args=["--silent", "--prefix", "canvas-lms-mcp", "start"],
        env={
            "CANVAS_API_TOKEN": canvas_token,
            "CANVAS_BASE_URL": canvas_url,
        }
    )
    
    # Configure the Antigravity Agent
    config = LocalAgentConfig(
        system_instructions="You are a helpful assistant that can check Canvas LMS details.",
        skills_paths=[".agents/skills"],
        mcp_servers=[mcp_config],
        policies=[policy.allow_all()],
    )
    
    print("Initializing Antigravity Agent...")
    async with Agent(config) as agent:
        print("Agent session started. Sending request to verify get_current_user tool...")
        response = await agent.chat("Canvasのログインユーザー情報を確認してください。")
        print("\n=== Agent Response ===")
        print(await response.text())
        print("======================\n")

if __name__ == "__main__":
    asyncio.run(main())
