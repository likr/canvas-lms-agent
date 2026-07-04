const test = require("node:test");
const assert = require("node:assert");
const modules = require("../tools/modules");

test("list_modules tool requests course modules and formats items when requested", async () => {
  let calledUrl = null;
  let calledParams = null;

  const mockClient = {
    get: async (url, config) => {
      calledUrl = url;
      calledParams = config?.params;
      return {
        data: [
          {
            id: 119537,
            name: "Week 1",
            position: 1,
            items_count: 2,
            items: [
              { id: 411573, title: "Syllabus", type: "Page", external_url: null },
              { id: 411574, title: "Google", type: "ExternalUrl", external_url: "https://google.com" },
            ],
          },
        ],
      };
    },
  };

  const result = await modules.handlers.list_modules(mockClient, { course_id: 101, include_items: true });
  assert.strictEqual(calledUrl, "/api/v1/courses/101/modules");
  assert.deepStrictEqual(calledParams, { "include[]": ["items"] });
  assert.strictEqual(result.length, 1);
  assert.deepStrictEqual(result[0], {
    id: 119537,
    name: "Week 1",
    position: 1,
    items_count: 2,
    items: [
      { id: 411573, title: "Syllabus", type: "Page", external_url: null },
      { id: 411574, title: "Google", type: "ExternalUrl", external_url: "https://google.com" },
    ],
  });
});

test("get_module tool calls correct endpoint", async () => {
  let calledUrl = null;
  const mockClient = {
    get: async (url) => {
      calledUrl = url;
      return {
        data: { id: 119537, name: "Week 1", position: 1, items_count: 2, unlock_at: "2026-05-01T00:00:00Z", require_sequential_progress: true },
      };
    },
  };
  const result = await modules.handlers.get_module(mockClient, { course_id: 101, id: 119537 });
  assert.strictEqual(calledUrl, "/api/v1/courses/101/modules/119537");
  assert.deepStrictEqual(result, {
    id: 119537,
    name: "Week 1",
    position: 1,
    items_count: 2,
    unlock_at: "2026-05-01T00:00:00Z",
    require_sequential_progress: true,
  });
});

test("create_module tool calls post with correct payload", async () => {
  let calledUrl = null;
  let calledPayload = null;
  const mockClient = {
    post: async (url, payload) => {
      calledUrl = url;
      calledPayload = payload;
      return {
        data: { id: 119538, name: "Week 2", position: 2, items_count: 0, unlock_at: null, require_sequential_progress: false },
      };
    },
  };
  const result = await modules.handlers.create_module(mockClient, { course_id: 101, name: "Week 2", position: 2 });
  assert.strictEqual(calledUrl, "/api/v1/courses/101/modules");
  assert.deepStrictEqual(calledPayload, { module: { name: "Week 2", position: 2 } });
  assert.deepStrictEqual(result, {
    id: 119538,
    name: "Week 2",
    position: 2,
    items_count: 0,
    unlock_at: null,
    require_sequential_progress: false,
  });
});

test("update_module tool calls put with correct payload", async () => {
  let calledUrl = null;
  let calledPayload = null;
  const mockClient = {
    put: async (url, payload) => {
      calledUrl = url;
      calledPayload = payload;
      return {
        data: { id: 119537, name: "Week 1 Updated", position: 1, items_count: 2, unlock_at: "2026-05-02T00:00:00Z", require_sequential_progress: true },
      };
    },
  };
  const result = await modules.handlers.update_module(mockClient, { course_id: 101, id: 119537, name: "Week 1 Updated", unlock_at: "2026-05-02T00:00:00Z" });
  assert.strictEqual(calledUrl, "/api/v1/courses/101/modules/119537");
  assert.deepStrictEqual(calledPayload, { module: { name: "Week 1 Updated", unlock_at: "2026-05-02T00:00:00Z" } });
  assert.deepStrictEqual(result, {
    id: 119537,
    name: "Week 1 Updated",
    position: 1,
    items_count: 2,
    unlock_at: "2026-05-02T00:00:00Z",
    require_sequential_progress: true,
  });
});

test("delete_module tool calls delete endpoint", async () => {
  let calledUrl = null;
  const mockClient = {
    delete: async (url) => {
      calledUrl = url;
      return {
        data: { id: 119537, name: "Week 1", position: 1 },
      };
    },
  };
  const result = await modules.handlers.delete_module(mockClient, { course_id: 101, id: 119537 });
  assert.strictEqual(calledUrl, "/api/v1/courses/101/modules/119537");
  assert.deepStrictEqual(result, {
    id: 119537,
    name: "Week 1",
    position: 1,
  });
});
