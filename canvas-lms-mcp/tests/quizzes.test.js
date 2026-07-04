const test = require("node:test");
const assert = require("node:assert");
const quizzes = require("../tools/quizzes");

test("list_quizzes lists all course quizzes", async () => {
  let calledUrl = null;

  const mockClient = {
    get: async (url) => {
      calledUrl = url;
      return {
        data: [
          { id: 701, title: "Quiz 1", points_possible: 20, question_count: 5, time_limit: 30, due_at: "2026-07-04T12:00:00Z", published: true },
        ],
      };
    },
  };

  const result = await quizzes.handlers.list_quizzes(mockClient, { course_id: 101 });
  assert.strictEqual(calledUrl, "/api/v1/courses/101/quizzes");
  assert.strictEqual(result.length, 1);
  assert.deepStrictEqual(result[0], {
    id: 701,
    title: "Quiz 1",
    points_possible: 20,
    question_count: 5,
    time_limit: 30,
    due_at: "2026-07-04T12:00:00Z",
    published: true,
  });
});

test("get_quiz tool calls correct endpoint", async () => {
  let calledUrl = null;
  const mockClient = {
    get: async (url) => {
      calledUrl = url;
      return {
        data: { id: 701, title: "Quiz 1", description: "Quiz desc", quiz_type: "assignment", points_possible: 20, question_count: 5, time_limit: 30, published: true },
      };
    },
  };
  const result = await quizzes.handlers.get_quiz(mockClient, { course_id: 101, id: 701 });
  assert.strictEqual(calledUrl, "/api/v1/courses/101/quizzes/701");
  assert.deepStrictEqual(result, {
    id: 701,
    title: "Quiz 1",
    description: "Quiz desc",
    quiz_type: "assignment",
    points_possible: 20,
    question_count: 5,
    time_limit: 30,
    published: true,
  });
});

test("create_quiz tool calls post with correct payload", async () => {
  let calledUrl = null;
  let calledPayload = null;
  const mockClient = {
    post: async (url, payload) => {
      calledUrl = url;
      calledPayload = payload;
      return {
        data: { id: 702, title: "Quiz 2", description: "Desc", quiz_type: "practice_quiz", points_possible: 0, question_count: 0, time_limit: null, published: false },
      };
    },
  };
  const result = await quizzes.handlers.create_quiz(mockClient, { course_id: 101, title: "Quiz 2", quiz_type: "practice_quiz" });
  assert.strictEqual(calledUrl, "/api/v1/courses/101/quizzes");
  assert.deepStrictEqual(calledPayload, { quiz: { title: "Quiz 2", quiz_type: "practice_quiz" } });
  assert.deepStrictEqual(result, {
    id: 702,
    title: "Quiz 2",
    description: "Desc",
    quiz_type: "practice_quiz",
    points_possible: 0,
    question_count: 0,
    time_limit: null,
    published: false,
  });
});

test("update_quiz tool calls put with correct payload", async () => {
  let calledUrl = null;
  let calledPayload = null;
  const mockClient = {
    put: async (url, payload) => {
      calledUrl = url;
      calledPayload = payload;
      return {
        data: { id: 701, title: "Quiz 1 Updated", description: "New desc", quiz_type: "assignment", points_possible: 20, question_count: 5, time_limit: 45, published: true },
      };
    },
  };
  const result = await quizzes.handlers.update_quiz(mockClient, { course_id: 101, id: 701, title: "Quiz 1 Updated", time_limit: 45 });
  assert.strictEqual(calledUrl, "/api/v1/courses/101/quizzes/701");
  assert.deepStrictEqual(calledPayload, { quiz: { title: "Quiz 1 Updated", time_limit: 45 } });
  assert.deepStrictEqual(result, {
    id: 701,
    title: "Quiz 1 Updated",
    description: "New desc",
    quiz_type: "assignment",
    points_possible: 20,
    question_count: 5,
    time_limit: 45,
    published: true,
  });
});

test("delete_quiz tool calls delete endpoint", async () => {
  let calledUrl = null;
  const mockClient = {
    delete: async (url) => {
      calledUrl = url;
      return {
        data: { id: 701, title: "Quiz 1", description: "Quiz desc" },
      };
    },
  };
  const result = await quizzes.handlers.delete_quiz(mockClient, { course_id: 101, id: 701 });
  assert.strictEqual(calledUrl, "/api/v1/courses/101/quizzes/701");
  assert.deepStrictEqual(result, {
    id: 701,
    title: "Quiz 1",
    description: "Quiz desc",
  });
});
