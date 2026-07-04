const definitions = [
  {
    name: "list_modules",
    description: "Retrieves the list of modules for a specific Canvas course, optionally including module items.",
    inputSchema: {
      type: "object",
      properties: {
        course_id: {
          type: "number",
          description: "The unique ID of the Canvas course.",
        },
        include_items: {
          type: "boolean",
          description: "Optional. Set to true to include the items list within each module structure.",
        },
      },
      required: ["course_id"],
    },
  },
  {
    name: "get_module",
    description: "Retrieves details of a specific module.",
    inputSchema: {
      type: "object",
      properties: {
        course_id: { type: "number", description: "The unique ID of the Canvas course." },
        id: { type: "number", description: "The unique ID of the module." },
      },
      required: ["course_id", "id"],
    },
  },
  {
    name: "create_module",
    description: "Creates a new module for a course.",
    inputSchema: {
      type: "object",
      properties: {
        course_id: { type: "number", description: "The unique ID of the Canvas course." },
        name: { type: "string", description: "The name of the module." },
        unlock_at: { type: "string", description: "Optional. ISO 8601 unlock date." },
        position: { type: "number", description: "Optional. Position (1-based)." },
        require_sequential_progress: { type: "boolean", description: "Optional. Force sequential items progress." },
      },
      required: ["course_id", "name"],
    },
  },
  {
    name: "update_module",
    description: "Updates an existing module.",
    inputSchema: {
      type: "object",
      properties: {
        course_id: { type: "number", description: "The unique ID of the Canvas course." },
        id: { type: "number", description: "The unique ID of the module." },
        name: { type: "string", description: "Optional. The name of the module." },
        unlock_at: { type: "string", description: "Optional. ISO 8601 unlock date." },
        position: { type: "number", description: "Optional. Position (1-based)." },
        require_sequential_progress: { type: "boolean", description: "Optional. Force sequential items progress." },
      },
      required: ["course_id", "id"],
    },
  },
  {
    name: "delete_module",
    description: "Deletes a module.",
    inputSchema: {
      type: "object",
      properties: {
        course_id: { type: "number", description: "The unique ID of the Canvas course." },
        id: { type: "number", description: "The unique ID of the module." },
      },
      required: ["course_id", "id"],
    },
  },
];

const handlers = {
  list_modules: async (client, args) => {
    const courseId = args.course_id;
    if (!courseId) {
      throw new Error("Missing required argument: course_id");
    }
    const params = {};
    if (args.include_items) {
      params["include[]"] = ["items"];
    }
    const response = await client.get(`/api/v1/courses/${courseId}/modules`, { params });
    const modules = Array.isArray(response.data) ? response.data : [];
    return modules.map(m => {
      const items = Array.isArray(m.items) ? m.items : [];
      const resultModule = {
        id: m.id,
        name: m.name,
        position: m.position,
        items_count: m.items_count,
      };
      if (args.include_items) {
        resultModule.items = items.map(item => ({
          id: item.id,
          title: item.title,
          type: item.type,
          external_url: item.external_url,
        }));
      }
      return resultModule;
    });
  },

  get_module: async (client, args) => {
    const { course_id: courseId, id } = args;
    if (!courseId || !id) {
      throw new Error("Missing required arguments: course_id, id");
    }
    const response = await client.get(`/api/v1/courses/${courseId}/modules/${id}`);
    const m = response.data || {};
    return {
      id: m.id,
      name: m.name,
      position: m.position,
      items_count: m.items_count,
      unlock_at: m.unlock_at,
      require_sequential_progress: m.require_sequential_progress,
    };
  },

  create_module: async (client, args) => {
    const { course_id: courseId, name, unlock_at, position, require_sequential_progress } = args;
    if (!courseId || !name) {
      throw new Error("Missing required arguments: course_id, name");
    }

    const payload = { module: { name } };
    if (unlock_at !== undefined) payload.module.unlock_at = unlock_at;
    if (position !== undefined) payload.module.position = position;
    if (require_sequential_progress !== undefined) {
      payload.module.require_sequential_progress = require_sequential_progress;
    }

    const response = await client.post(`/api/v1/courses/${courseId}/modules`, payload);
    const m = response.data || {};
    return {
      id: m.id,
      name: m.name,
      position: m.position,
      items_count: m.items_count,
      unlock_at: m.unlock_at,
      require_sequential_progress: m.require_sequential_progress,
    };
  },

  update_module: async (client, args) => {
    const { course_id: courseId, id, name, unlock_at, position, require_sequential_progress } = args;
    if (!courseId || !id) {
      throw new Error("Missing required arguments: course_id, id");
    }

    const payload = { module: {} };
    if (name !== undefined) payload.module.name = name;
    if (unlock_at !== undefined) payload.module.unlock_at = unlock_at;
    if (position !== undefined) payload.module.position = position;
    if (require_sequential_progress !== undefined) {
      payload.module.require_sequential_progress = require_sequential_progress;
    }

    const response = await client.put(`/api/v1/courses/${courseId}/modules/${id}`, payload);
    const m = response.data || {};
    return {
      id: m.id,
      name: m.name,
      position: m.position,
      items_count: m.items_count,
      unlock_at: m.unlock_at,
      require_sequential_progress: m.require_sequential_progress,
    };
  },

  delete_module: async (client, args) => {
    const { course_id: courseId, id } = args;
    if (!courseId || !id) {
      throw new Error("Missing required arguments: course_id, id");
    }
    const response = await client.delete(`/api/v1/courses/${courseId}/modules/${id}`);
    const m = response.data || {};
    return {
      id: m.id,
      name: m.name,
      position: m.position,
    };
  },
};

module.exports = {
  definitions,
  handlers,
};
