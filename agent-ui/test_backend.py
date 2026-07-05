import os
import sys
import unittest
from fastapi.testclient import TestClient

# Ensure the agent-ui directory is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.index import app
from api.database import init_db, get_db, SessionLocal, User, Session as DBSession, Message, Memo

class TestBackendAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Set dummy GOOGLE_CLIENT_ID for bypass mode in testing
        os.environ["GOOGLE_CLIENT_ID"] = ""
        # Initialize database tables
        init_db()
        cls.client = TestClient(app)

    def setUp(self):
        # Clear DB tables to start clean
        db = SessionLocal()
        try:
            db.query(Message).delete()
            db.query(DBSession).delete()
            db.query(Memo).delete()
            db.query(User).delete()
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()

    def test_get_config(self):
        response = self.client.get("/api/config")
        self.assertEqual(response.status_code, 200)
        self.assertIn("google_client_id", response.json())

    def test_session_lifecycle(self):
        # Create session (Authorization Header is automatically mocked due to empty GOOGLE_CLIENT_ID)
        headers = {"Authorization": "Bearer mock-token"}
        
        # 1. Create a session
        create_res = self.client.post("/api/sessions", json={"title": "Test Course Inquiry"}, headers=headers)
        self.assertEqual(create_res.status_code, 200)
        session_data = create_res.json()
        self.assertIn("id", session_data)
        self.assertEqual(session_data["title"], "Test Course Inquiry")
        
        session_id = session_data["id"]

        # 2. List sessions
        list_res = self.client.get("/api/sessions", headers=headers)
        self.assertEqual(list_res.status_code, 200)
        sessions_list = list_res.json()
        self.assertEqual(len(sessions_list), 1)
        self.assertEqual(sessions_list[0]["id"], session_id)

        # 3. Get messages (should be empty initially)
        msg_res = self.client.get(f"/api/sessions/{session_id}/messages", headers=headers)
        self.assertEqual(msg_res.status_code, 200)
        self.assertEqual(len(msg_res.json()), 0)

        # 4. Delete session
        delete_res = self.client.delete(f"/api/sessions/{session_id}", headers=headers)
        self.assertEqual(delete_res.status_code, 200)
        self.assertEqual(delete_res.json(), {"status": "success"})

        # 5. List sessions again (should be empty)
        list_res_after = self.client.get("/api/sessions", headers=headers)
        self.assertEqual(list_res_after.status_code, 200)
        self.assertEqual(len(list_res_after.json()), 0)

    def test_list_memos(self):
        headers = {"Authorization": "Bearer mock-token"}
        response = self.client.get("/api/memos", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

if __name__ == "__main__":
    unittest.main()
