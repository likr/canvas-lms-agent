const path = require("path");
const fs = require("fs");
const { callCanvasApi } = require("./helper");

// Load endpoints synchronously since it's just a JSON file and needed at startup
const endpointsPath = path.join(__dirname, "endpoints.json");
const endpointsData = JSON.parse(fs.readFileSync(endpointsPath, "utf-8"));

const allDefinitions = [
  {
    name: "search_canvas_api",
    description: "Search for Canvas LMS API endpoints and their schemas. Use this when you need to find the correct path, method, or parameters for a Canvas LMS API call.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query to filter endpoints by path or description (e.g., 'courses', 'get users')."
        }
      },
      required: ["query"]
    }
  },
  {
    name: "call_canvas_api_get",
    description: "Call a Canvas LMS API endpoint using GET method. Use this for retrieving resources. You must construct the path yourself (e.g., /api/v1/courses/1). Do NOT use path templates like :course_id.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "API path starting with a slash (e.g., /api/v1/courses/1)."
        },
        query_params: {
          type: "object",
          description: "Query parameters (optional)"
        }
      },
      required: ["path"]
    }
  },
  {
    name: "call_canvas_api_post",
    description: "Call a Canvas LMS API endpoint using POST method. Use this for creating resources. You must construct the path yourself.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "API path starting with a slash (e.g., /api/v1/courses)."
        },
        query_params: {
          type: "object",
          description: "Query parameters (optional)"
        },
        body_params: {
          type: "object",
          description: "Body parameters (optional)"
        }
      },
      required: ["path"]
    }
  },
  {
    name: "call_canvas_api_put",
    description: "Call a Canvas LMS API endpoint using PUT method. Use this for updating resources. You must construct the path yourself.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "API path starting with a slash (e.g., /api/v1/courses/1)."
        },
        query_params: {
          type: "object",
          description: "Query parameters (optional)"
        },
        body_params: {
          type: "object",
          description: "Body parameters (optional)"
        }
      },
      required: ["path"]
    }
  },
  {
    name: "call_canvas_api_delete",
    description: "Call a Canvas LMS API endpoint using DELETE method. Use this for deleting resources. You must construct the path yourself.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "API path starting with a slash (e.g., /api/v1/courses/1)."
        },
        query_params: {
          type: "object",
          description: "Query parameters (optional)"
        }
      },
      required: ["path"]
    }
  }
];

const allHandlers = {
  search_canvas_api: async (client, args) => {
    const query = args.query.toLowerCase();
    const results = endpointsData.filter(ep => {
      return ep.path.toLowerCase().includes(query) || 
             ep.description.toLowerCase().includes(query);
    });
    
    // Limit to top 50 results to avoid massive responses
    return {
      results: results.slice(0, 50),
      total_matches: results.length,
      truncated: results.length > 50
    };
  },
  call_canvas_api_get: async (client, args) => {
    return callCanvasApi(client, "GET", args.path, args.query_params || {}, {});
  },
  call_canvas_api_post: async (client, args) => {
    return callCanvasApi(client, "POST", args.path, args.query_params || {}, args.body_params || {});
  },
  call_canvas_api_put: async (client, args) => {
    return callCanvasApi(client, "PUT", args.path, args.query_params || {}, args.body_params || {});
  },
  call_canvas_api_delete: async (client, args) => {
    return callCanvasApi(client, "DELETE", args.path, args.query_params || {}, {});
  }
};

module.exports = {
  allDefinitions,
  allHandlers,
};
