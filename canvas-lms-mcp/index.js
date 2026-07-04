const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const axios = require("axios");

// Initialize server
const server = new Server(
  {
    name: "canvas-lms-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Get environment configurations
const CANVAS_BASE_URL = process.env.CANVAS_BASE_URL || "https://canvas.instructure.com";
const CANVAS_API_TOKEN = process.env.CANVAS_API_TOKEN;

// Helper to create Canvas Axios client
function getCanvasClient() {
  if (!CANVAS_API_TOKEN) {
    throw new Error("CANVAS_API_TOKEN environment variable is not configured.");
  }
  return axios.create({
    baseURL: CANVAS_BASE_URL.replace(/\/$/, ""),
    headers: {
      Authorization: `Bearer ${CANVAS_API_TOKEN}`,
      Accept: "application/json",
    },
  });
}

// Define tools list
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_current_user",
        description: "Retrieves details about the authenticated Canvas user to verify credentials.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "list_courses",
        description: "Retrieves the list of active courses for the authenticated user.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "list_assignments",
        description: "Retrieves the list of assignments for a specific Canvas course.",
        inputSchema: {
          type: "object",
          properties: {
            course_id: {
              type: "number",
              description: "The unique ID of the Canvas course.",
            },
          },
          required: ["course_id"],
        },
      },
      {
        name: "get_user_grades",
        description: "Retrieves submission and grading details for assignments in a specific course. Can query self or a specific student.",
        inputSchema: {
          type: "object",
          properties: {
            course_id: {
              type: "number",
              description: "The unique ID of the Canvas course.",
            },
            student_id: {
              type: "number",
              description: "Optional. The student ID to get grades for. If omitted, retrieves grades for the logged-in user ('self').",
            },
          },
          required: ["course_id"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const client = getCanvasClient();

    if (name === "get_current_user") {
      const response = await client.get("/api/v1/users/self");
      const user = response.data;
      const result = {
        id: user.id,
        name: user.name,
        short_name: user.short_name,
        primary_email: user.primary_email || user.email || "N/A",
        login_id: user.login_id,
        time_zone: user.time_zone,
      };
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } 
    
    else if (name === "list_courses") {
      const response = await client.get("/api/v1/courses", {
        params: { enrollment_state: "active" }
      });
      const courses = Array.isArray(response.data) ? response.data : [];
      const result = courses.map(course => ({
        id: course.id,
        name: course.name || course.course_code,
        course_code: course.course_code,
        start_at: course.start_at,
      }));
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } 
    
    else if (name === "list_assignments") {
      const courseId = args.course_id;
      if (!courseId) {
        throw new Error("Missing required argument: course_id");
      }
      const response = await client.get(`/api/v1/courses/${courseId}/assignments`);
      const assignments = Array.isArray(response.data) ? response.data : [];
      const result = assignments.map(asm => ({
        id: asm.id,
        name: asm.name,
        points_possible: asm.points_possible,
        due_at: asm.due_at,
        has_submitted_submissions: asm.has_submitted_submissions,
      }));
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } 
    
    else if (name === "get_user_grades") {
      const courseId = args.course_id;
      if (!courseId) {
        throw new Error("Missing required argument: course_id");
      }
      
      // Fetch course details with enrollments to check the user's role
      const courseResponse = await client.get(`/api/v1/courses/${courseId}`, {
        params: { "include[]": ["enrollments"] }
      });
      const enrollments = courseResponse.data.enrollments || [];
      const isTeacherOrStaff = enrollments.some(e => 
        e.type === "teacher" || e.type === "ta" || e.type === "designer" || e.type === "observer"
      );
      
      const params = {
        "include[]": ["assignment"]
      };
      
      if (args.student_id) {
        params["student_ids[]"] = [args.student_id];
      } else if (isTeacherOrStaff) {
        // Teachers / TA / staff default to retrieving submissions for all students
        params["student_ids[]"] = ["all"];
      }
      
      const response = await client.get(`/api/v1/courses/${courseId}/students/submissions`, {
        params: params
      });
      
      const submissions = Array.isArray(response.data) ? response.data : [];
      const result = submissions.map(sub => {
        const asm = sub.assignment || {};
        return {
          assignment_id: sub.assignment_id,
          assignment_name: asm.name || "N/A",
          points_possible: asm.points_possible,
          score: sub.score !== null ? sub.score : "Not Graded",
          grade: sub.grade !== null ? sub.grade : "N/A",
          submitted_at: sub.submitted_at,
          graded_at: sub.graded_at,
          excused: sub.excused,
        };
      });
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } 
    
    else {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Unknown tool: ${name}`,
          },
        ],
      };
    }
  } catch (error) {
    let errorMsg = error.message;
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const data = error.response.data;
      errorMsg = `Canvas API returned status code ${status}: ${JSON.stringify(data)}`;
      if (status === 401) {
        errorMsg = "Unauthorized: Please verify that CANVAS_API_TOKEN is valid.";
      } else if (status === 404) {
        errorMsg = "Not Found: The requested endpoint was not found on Canvas.";
      }
    }
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error executing tool '${name}': ${errorMsg}`,
        },
      ],
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Canvas LMS MCP Server started successfully (stdio)");
}

main().catch((error) => {
  console.error("Fatal error starting Canvas LMS MCP Server:", error);
  process.exit(1);
});
