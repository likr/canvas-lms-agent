const definitions = [
  {
    name: "list_discussion_topics",
    description: "Retrieves the list of discussion topics for a specific Canvas course.",
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
    name: "list_announcements",
    description: "Retrieves announcements (system updates and course bulletins) for a specific Canvas course.",
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
    name: "create_discussion_topic",
    description: "Creates a new discussion topic or announcement.",
    inputSchema: {
      type: "object",
      properties: {
        course_id: { type: "number", description: "The unique ID of the Canvas course." },
        title: { type: "string", description: "The title of the discussion topic." },
        message: { type: "string", description: "Optional. The message body of the discussion topic." },
        published: { type: "boolean", description: "Optional. Published state." },
        discussion_type: { type: "string", description: "Optional. side_comment, threaded, not_threaded." },
        is_announcement: { type: "boolean", description: "Optional. Set to true to create an announcement." },
      },
      required: ["course_id", "title"],
    },
  },
];

const handlers = {
  list_discussion_topics: async (client, args) => {
    const courseId = args.course_id;
    if (!courseId) {
      throw new Error("Missing required argument: course_id");
    }
    const response = await client.get(`/api/v1/courses/${courseId}/discussion_topics`);
    const topics = Array.isArray(response.data) ? response.data : [];
    return topics.map(t => ({
      id: t.id,
      title: t.title,
      message: t.message,
      posted_at: t.posted_at,
      user_name: t.user_name,
      last_reply_at: t.last_reply_at,
      discussion_type: t.discussion_type,
    }));
  },

  list_announcements: async (client, args) => {
    const courseId = args.course_id;
    if (!courseId) {
      throw new Error("Missing required argument: course_id");
    }
    const response = await client.get(`/api/v1/courses/${courseId}/discussion_topics`, {
      params: { only_announcements: true }
    });
    const topics = Array.isArray(response.data) ? response.data : [];
    return topics.map(a => ({
      id: a.id,
      title: a.title,
      message: a.message,
      posted_at: a.posted_at,
      user_name: a.user_name,
      last_reply_at: a.last_reply_at,
      locked: a.locked,
      pinned: a.pinned,
    }));
  },

  create_discussion_topic: async (client, args) => {
    const { course_id: courseId, title, message, published, discussion_type, is_announcement } = args;
    if (!courseId || !title) {
      throw new Error("Missing required arguments: course_id, title");
    }

    const payload = { title };
    if (message !== undefined) payload.message = message;
    if (published !== undefined) payload.published = published;
    if (discussion_type !== undefined) payload.discussion_type = discussion_type;
    if (is_announcement !== undefined) payload.is_announcement = is_announcement;

    const response = await client.post(`/api/v1/courses/${courseId}/discussion_topics`, payload);
    const t = response.data || {};
    return {
      id: t.id,
      title: t.title,
      message: t.message,
      posted_at: t.posted_at,
      discussion_type: t.discussion_type,
      is_announcement: t.is_announcement,
    };
  },
};

module.exports = {
  definitions,
  handlers,
};
