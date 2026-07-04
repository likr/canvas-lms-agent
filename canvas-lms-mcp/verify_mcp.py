import subprocess
import json
import sys
import os
from dotenv import load_dotenv

def test_mcp_server():
    load_dotenv()
    
    token = os.getenv("CANVAS_API_TOKEN")
    url = os.getenv("CANVAS_BASE_URL")
    print(f"Loaded config: BASE_URL={url}, TOKEN_SET={bool(token)}")
    
    # Launch MCP server process
    proc = subprocess.Popen(
        ["node", "canvas-lms-mcp/index.js"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )
    
    try:
        # Step 1: Send tools/list request
        list_req = {
            "jsonrpc": "2.0",
            "method": "tools/list",
            "params": {},
            "id": 1
        }
        print("Sending tools/list request...")
        proc.stdin.write(json.dumps(list_req) + "\n")
        proc.stdin.flush()
        
        stdout_line = proc.stdout.readline()
        if not stdout_line:
            print("ERROR: No response from MCP server.")
            proc.terminate()
            stderr_output = proc.stderr.read()
            print(f"Stderr output from server:\n{stderr_output}")
            sys.exit(1)
            
        list_resp = json.loads(stdout_line)
        tools = list_resp.get("result", {}).get("tools", [])
        tool_names = [t.get("name") for t in tools]
        print(f"Available tools: {tool_names}")
        
        expected_tools = ["get_current_user", "list_courses", "list_assignments", "get_user_grades"]
        for expected in expected_tools:
            assert expected in tool_names, f"Expected tool '{expected}' is missing!"
        print("PASS: tools/list test successful.")
        
        # Step 2: Test get_current_user
        call_req = {
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {
                "name": "get_current_user",
                "arguments": {}
            },
            "id": 2
        }
        print("Testing get_current_user...")
        proc.stdin.write(json.dumps(call_req) + "\n")
        proc.stdin.flush()
        stdout_line = proc.stdout.readline()
        call_resp = json.loads(stdout_line)
        result = call_resp.get("result", {})
        assert not result.get("isError", False), f"get_current_user failed: {result}"
        user_data = json.loads(result.get("content", [])[0].get("text", "{}"))
        print(f"Authenticated user: {user_data.get('name')} (ID: {user_data.get('id')})")
        print("PASS: get_current_user test successful.")
        
        # Step 3: Test list_courses
        call_courses = {
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {
                "name": "list_courses",
                "arguments": {}
            },
            "id": 3
        }
        print("Testing list_courses...")
        proc.stdin.write(json.dumps(call_courses) + "\n")
        proc.stdin.flush()
        stdout_line = proc.stdout.readline()
        call_resp = json.loads(stdout_line)
        result = call_resp.get("result", {})
        assert not result.get("isError", False), f"list_courses failed: {result}"
        courses_data = json.loads(result.get("content", [])[0].get("text", "[]"))
        print(f"Found {len(courses_data)} active courses.")
        if courses_data:
            print(f"First course: {courses_data[0]}")
            course_id = courses_data[0].get("id")
            
            # Step 4: Test list_assignments
            call_assignments = {
                "jsonrpc": "2.0",
                "method": "tools/call",
                "params": {
                    "name": "list_assignments",
                    "arguments": {
                        "course_id": course_id
                    }
                },
                "id": 4
            }
            print(f"Testing list_assignments for course {course_id}...")
            proc.stdin.write(json.dumps(call_assignments) + "\n")
            proc.stdin.flush()
            stdout_line = proc.stdout.readline()
            call_resp = json.loads(stdout_line)
            result = call_resp.get("result", {})
            assert not result.get("isError", False), f"list_assignments failed: {result}"
            assignments_data = json.loads(result.get("content", [])[0].get("text", "[]"))
            print(f"Found {len(assignments_data)} assignments in course {course_id}.")
            if assignments_data:
                print(f"First assignment: {assignments_data[0]}")
                
            # Step 5: Test get_user_grades
            call_grades = {
                "jsonrpc": "2.0",
                "method": "tools/call",
                "params": {
                    "name": "get_user_grades",
                    "arguments": {
                        "course_id": course_id
                    }
                },
                "id": 5
            }
            print(f"Testing get_user_grades for course {course_id}...")
            proc.stdin.write(json.dumps(call_grades) + "\n")
            proc.stdin.flush()
            stdout_line = proc.stdout.readline()
            call_resp = json.loads(stdout_line)
            result = call_resp.get("result", {})
            assert not result.get("isError", False), f"get_user_grades failed: {result}"
            grades_data = json.loads(result.get("content", [])[0].get("text", "[]"))
            print(f"Found {len(grades_data)} submission grades in course {course_id}.")
            if grades_data:
                print(f"First grade detail: {grades_data[0]}")
                
        else:
            print("No active courses found to perform list_assignments/get_user_grades testing.")
            
        print("ALL MCP SERVER TESTS PASSED SUCCESSFULLY!")
        
    except Exception as e:
        print(f"Exception during test: {e}")
        proc.terminate()
        stderr_output = proc.stderr.read()
        print(f"Stderr output from server:\n{stderr_output}")
        sys.exit(1)
        
    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    test_mcp_server()
