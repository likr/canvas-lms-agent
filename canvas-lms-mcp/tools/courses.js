const definitions = [
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
    name: "get_course",
    description: "Retrieves details about a specific course by ID.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "The unique ID of the Canvas course.",
        },
      },
      required: ["id"],
    },
  },
];

const handlers = {
  get_current_user: async (client) => {
    const response = await client.get("/api/v1/users/self");
    const user = response.data;
    return {
      id: user.id,
      name: user.name,
      short_name: user.short_name,
      primary_email: user.primary_email || user.email || "N/A",
      login_id: user.login_id,
      time_zone: user.time_zone,
    };
  },

  list_courses: async (client) => {
    const response = await client.get("/api/v1/courses", {
      params: { enrollment_state: "active" }
    });
    const courses = Array.isArray(response.data) ? response.data : [];
    return courses.map(course => ({
      id: course.id,
      name: course.name || course.course_code,
      course_code: course.course_code,
      start_at: course.start_at,
    }));
  },

  get_course: async (client, args) => {
    const id = args.id;
    if (!id) {
      throw new Error("Missing required argument: id");
    }
    const response = await client.get(`/api/v1/courses/${id}`);
    const course = response.data || {};
    return {
      id: course.id,
      name: course.name || course.course_code,
      course_code: course.course_code,
      start_at: course.start_at,
      end_at: course.end_at,
      time_zone: course.time_zone,
    };
  },
};

module.exports = {
  definitions,
  handlers,
};
