const definitions = [
  {
    name: "list_pages",
    description: "Retrieves the list of wiki pages for a specific Canvas course.",
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
    name: "get_page",
    description: "Retrieves the detailed wiki page contents (HTML body) for a course page.",
    inputSchema: {
      type: "object",
      properties: {
        course_id: {
          type: "number",
          description: "The unique ID of the Canvas course.",
        },
        url_or_id: {
          type: "string",
          description: "The URL key or unique ID of the page.",
        },
      },
      required: ["course_id", "url_or_id"],
    },
  },
  {
    name: "create_page",
    description: "Creates a new wiki page.",
    inputSchema: {
      type: "object",
      properties: {
        course_id: { type: "number", description: "The unique ID of the Canvas course." },
        title: { type: "string", description: "The title of the wiki page." },
        body: { type: "string", description: "Optional. HTML content of the page." },
        published: { type: "boolean", description: "Optional. Published state." },
        front_page: { type: "boolean", description: "Optional. Set as the front page." },
      },
      required: ["course_id", "title"],
    },
  },
  {
    name: "update_page",
    description: "Updates an existing wiki page.",
    inputSchema: {
      type: "object",
      properties: {
        course_id: { type: "number", description: "The unique ID of the Canvas course." },
        url_or_id: { type: "string", description: "The URL key or unique ID of the page." },
        title: { type: "string", description: "Optional. The title of the page." },
        body: { type: "string", description: "Optional. HTML content." },
        published: { type: "boolean", description: "Optional. Published state." },
        front_page: { type: "boolean", description: "Optional. Set as the front page." },
      },
      required: ["course_id", "url_or_id"],
    },
  },
  {
    name: "delete_page",
    description: "Deletes a wiki page.",
    inputSchema: {
      type: "object",
      properties: {
        course_id: { type: "number", description: "The unique ID of the Canvas course." },
        url_or_id: { type: "string", description: "The URL key or unique ID of the page." },
      },
      required: ["course_id", "url_or_id"],
    },
  },
];

const handlers = {
  list_pages: async (client, args) => {
    const courseId = args.course_id;
    if (!courseId) {
      throw new Error("Missing required argument: course_id");
    }
    const response = await client.get(`/api/v1/courses/${courseId}/pages`);
    const pages = Array.isArray(response.data) ? response.data : [];
    return pages.map(p => ({
      page_id: p.page_id,
      url: p.url,
      title: p.title,
      updated_at: p.updated_at,
      published: p.published,
      front_page: p.front_page,
    }));
  },

  get_page: async (client, args) => {
    const courseId = args.course_id;
    const urlOrId = args.url_or_id;
    if (!courseId || !urlOrId) {
      throw new Error("Missing required arguments: course_id, url_or_id");
    }
    const response = await client.get(`/api/v1/courses/${courseId}/pages/${urlOrId}`);
    const p = response.data || {};
    return {
      page_id: p.page_id,
      url: p.url,
      title: p.title,
      body: p.body,
      updated_at: p.updated_at,
      published: p.published,
    };
  },

  create_page: async (client, args) => {
    const { course_id: courseId, title, body, published, front_page } = args;
    if (!courseId || !title) {
      throw new Error("Missing required arguments: course_id, title");
    }

    const payload = { wiki_page: { title } };
    if (body !== undefined) payload.wiki_page.body = body;
    if (published !== undefined) payload.wiki_page.published = published;
    if (front_page !== undefined) payload.wiki_page.front_page = front_page;

    const response = await client.post(`/api/v1/courses/${courseId}/pages`, payload);
    const p = response.data || {};
    return {
      page_id: p.page_id,
      url: p.url,
      title: p.title,
      body: p.body,
      updated_at: p.updated_at,
      published: p.published,
      front_page: p.front_page,
    };
  },

  update_page: async (client, args) => {
    const { course_id: courseId, url_or_id: urlOrId, title, body, published, front_page } = args;
    if (!courseId || !urlOrId) {
      throw new Error("Missing required arguments: course_id, url_or_id");
    }

    const payload = { wiki_page: {} };
    if (title !== undefined) payload.wiki_page.title = title;
    if (body !== undefined) payload.wiki_page.body = body;
    if (published !== undefined) payload.wiki_page.published = published;
    if (front_page !== undefined) payload.wiki_page.front_page = front_page;

    const response = await client.put(`/api/v1/courses/${courseId}/pages/${urlOrId}`, payload);
    const p = response.data || {};
    return {
      page_id: p.page_id,
      url: p.url,
      title: p.title,
      body: p.body,
      updated_at: p.updated_at,
      published: p.published,
      front_page: p.front_page,
    };
  },

  delete_page: async (client, args) => {
    const { course_id: courseId, url_or_id: urlOrId } = args;
    if (!courseId || !urlOrId) {
      throw new Error("Missing required arguments: course_id, url_or_id");
    }
    const response = await client.delete(`/api/v1/courses/${courseId}/pages/${urlOrId}`);
    const p = response.data || {};
    return {
      page_id: p.page_id,
      url: p.url,
      title: p.title,
    };
  },
};

module.exports = {
  definitions,
  handlers,
};
