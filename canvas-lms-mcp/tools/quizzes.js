const definitions = [
  {
    name: "list_quizzes",
    description: "Retrieves the list of quizzes for a specific Canvas course.",
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
    name: "get_quiz",
    description: "Retrieves details of a specific quiz.",
    inputSchema: {
      type: "object",
      properties: {
        course_id: { type: "number", description: "The unique ID of the Canvas course." },
        id: { type: "number", description: "The unique ID of the quiz." },
      },
      required: ["course_id", "id"],
    },
  },
  {
    name: "create_quiz",
    description: "Creates a new quiz for a course.",
    inputSchema: {
      type: "object",
      properties: {
        course_id: { type: "number", description: "The unique ID of the Canvas course." },
        title: { type: "string", description: "The quiz title." },
        description: { type: "string", description: "Optional. Description of the quiz." },
        quiz_type: { type: "string", description: "Optional. practice_quiz, assignment, graded_survey, survey." },
        time_limit: { type: "number", description: "Optional. Time limit in minutes." },
        published: { type: "boolean", description: "Optional. Published state." },
      },
      required: ["course_id", "title"],
    },
  },
  {
    name: "update_quiz",
    description: "Updates an existing quiz.",
    inputSchema: {
      type: "object",
      properties: {
        course_id: { type: "number", description: "The unique ID of the Canvas course." },
        id: { type: "number", description: "The unique ID of the quiz." },
        title: { type: "string", description: "Optional. The quiz title." },
        description: { type: "string", description: "Optional. Description of the quiz." },
        quiz_type: { type: "string", description: "Optional. practice_quiz, assignment, graded_survey, survey." },
        time_limit: { type: "number", description: "Optional. Time limit in minutes." },
        published: { type: "boolean", description: "Optional. Published state." },
      },
      required: ["course_id", "id"],
    },
  },
  {
    name: "delete_quiz",
    description: "Deletes a quiz.",
    inputSchema: {
      type: "object",
      properties: {
        course_id: { type: "number", description: "The unique ID of the Canvas course." },
        id: { type: "number", description: "The unique ID of the quiz." },
      },
      required: ["course_id", "id"],
    },
  },
];

const handlers = {
  list_quizzes: async (client, args) => {
    const courseId = args.course_id;
    if (!courseId) {
      throw new Error("Missing required argument: course_id");
    }
    const response = await client.get(`/api/v1/courses/${courseId}/quizzes`);
    const quizzes = Array.isArray(response.data) ? response.data : [];
    return quizzes.map(q => ({
      id: q.id,
      title: q.title,
      points_possible: q.points_possible,
      question_count: q.question_count,
      time_limit: q.time_limit,
      due_at: q.due_at,
      published: q.published,
    }));
  },

  get_quiz: async (client, args) => {
    const { course_id: courseId, id } = args;
    if (!courseId || !id) {
      throw new Error("Missing required arguments: course_id, id");
    }
    const response = await client.get(`/api/v1/courses/${courseId}/quizzes/${id}`);
    const q = response.data || {};
    return {
      id: q.id,
      title: q.title,
      description: q.description,
      quiz_type: q.quiz_type,
      points_possible: q.points_possible,
      question_count: q.question_count,
      time_limit: q.time_limit,
      published: q.published,
    };
  },

  create_quiz: async (client, args) => {
    const { course_id: courseId, title, description, quiz_type, time_limit, published } = args;
    if (!courseId || !title) {
      throw new Error("Missing required arguments: course_id, title");
    }

    const payload = { quiz: { title } };
    if (description !== undefined) payload.quiz.description = description;
    if (quiz_type !== undefined) payload.quiz.quiz_type = quiz_type;
    if (time_limit !== undefined) payload.quiz.time_limit = time_limit;
    if (published !== undefined) payload.quiz.published = published;

    const response = await client.post(`/api/v1/courses/${courseId}/quizzes`, payload);
    const q = response.data || {};
    return {
      id: q.id,
      title: q.title,
      description: q.description,
      quiz_type: q.quiz_type,
      points_possible: q.points_possible,
      question_count: q.question_count,
      time_limit: q.time_limit,
      published: q.published,
    };
  },

  update_quiz: async (client, args) => {
    const { course_id: courseId, id, title, description, quiz_type, time_limit, published } = args;
    if (!courseId || !id) {
      throw new Error("Missing required arguments: course_id, id");
    }

    const payload = { quiz: {} };
    if (title !== undefined) payload.quiz.title = title;
    if (description !== undefined) payload.quiz.description = description;
    if (quiz_type !== undefined) payload.quiz.quiz_type = quiz_type;
    if (time_limit !== undefined) payload.quiz.time_limit = time_limit;
    if (published !== undefined) payload.quiz.published = published;

    const response = await client.put(`/api/v1/courses/${courseId}/quizzes/${id}`, payload);
    const q = response.data || {};
    return {
      id: q.id,
      title: q.title,
      description: q.description,
      quiz_type: q.quiz_type,
      points_possible: q.points_possible,
      question_count: q.question_count,
      time_limit: q.time_limit,
      published: q.published,
    };
  },

  delete_quiz: async (client, args) => {
    const { course_id: courseId, id } = args;
    if (!courseId || !id) {
      throw new Error("Missing required arguments: course_id, id");
    }
    const response = await client.delete(`/api/v1/courses/${courseId}/quizzes/${id}`);
    const q = response.data || {};
    return {
      id: q.id,
      title: q.title,
      description: q.description,
    };
  },
};

module.exports = {
  definitions,
  handlers,
};
