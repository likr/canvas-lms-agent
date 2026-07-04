---
name: canvas-lms
description: Use this skill when managing Canvas LMS tasks, such as checking course list, retrieving assignment details, or checking grades and submissions for users.
---

# Canvas LMS Skill Guide

This skill manual guides the agent in using the Canvas LMS MCP Server tools to interact with Canvas APIs.

## Setup / Initialization

Before executing any Canvas LMS tasks, start and connect to the MCP server using the following command:

```bash
npm --silent --prefix canvas-lms-mcp start
```

> [!IMPORTANT]
> Always run with the `--silent` flag. If `--silent` is omitted, `npm` writes startup banners to stdout, which corrupts the stdio JSON-RPC protocol stream and causes the agent connection to fail.

Make sure the following environment variables are supplied:
- `CANVAS_API_TOKEN`: The API access token generated from Canvas User Settings.
- `CANVAS_BASE_URL`: The URL of your Canvas instance (e.g. `https://nu.instructure.com/`).

---

## Workflow & Guidelines

When a Canvas LMS task is requested, perform operations in the following logical sequence:

1. **Verify User / Connection**:
   - Call `get_current_user` to test credentials and connectivity, ensuring that the token is valid and checking the current user's profile.

2. **Retrieve Courses**:
   - Call `list_courses` to obtain the list of active courses, noting their corresponding course IDs.

3. **Retrieve Assignments**:
   - For a given course ID, call `list_assignments` to fetch the list of assignments, noting assignment IDs and points possible.

4. **Retrieve Grades / Submissions**:
   - Call `get_user_grades` for the course ID.
   - **Role-Based Behavior**:
     - **For Teachers / TA / Staff**: If the user is enrolled as a teacher/staff in the course, the tool will automatically return submissions for **all** students in the course. You can check a specific student's grades by passing their `student_id` in arguments.
     - **For Students**: Omit the `student_id` argument to retrieve the calling student's own grades/submissions.
