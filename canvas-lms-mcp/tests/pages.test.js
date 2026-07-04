const test = require("node:test");
const assert = require("node:assert");
const pages = require("../tools/pages");

test("list_pages lists wiki pages", async () => {
  let calledUrl = null;

  const mockClient = {
    get: async (url) => {
      calledUrl = url;
      return {
        data: [
          { page_id: 601, url: "welcome", title: "Welcome Page", updated_at: "2026-07-01T00:00:00Z", published: true, front_page: true },
        ],
      };
    },
  };

  const result = await pages.handlers.list_pages(mockClient, { course_id: 101 });
  assert.strictEqual(calledUrl, "/api/v1/courses/101/pages");
  assert.strictEqual(result.length, 1);
  assert.deepStrictEqual(result[0], {
    page_id: 601,
    url: "welcome",
    title: "Welcome Page",
    updated_at: "2026-07-01T00:00:00Z",
    published: true,
    front_page: true,
  });
});

test("get_page retrieves specific page content body", async () => {
  let calledUrl = null;

  const mockClient = {
    get: async (url) => {
      calledUrl = url;
      return {
        data: {
          page_id: 601,
          url: "welcome",
          title: "Welcome Page",
          body: "<h1>Hello and welcome!</h1>",
          updated_at: "2026-07-01T00:00:00Z",
          published: true,
        },
      };
    },
  };

  const result = await pages.handlers.get_page(mockClient, { course_id: 101, url_or_id: "welcome" });
  assert.strictEqual(calledUrl, "/api/v1/courses/101/pages/welcome");
  assert.deepStrictEqual(result, {
    page_id: 601,
    url: "welcome",
    title: "Welcome Page",
    body: "<h1>Hello and welcome!</h1>",
    updated_at: "2026-07-01T00:00:00Z",
    published: true,
  });
});

test("create_page tool calls post with correct payload", async () => {
  let calledUrl = null;
  let calledPayload = null;
  const mockClient = {
    post: async (url, payload) => {
      calledUrl = url;
      calledPayload = payload;
      return {
        data: { page_id: 602, url: "about", title: "About Us", body: "<p>About info</p>", updated_at: "2026-07-04T12:00:00Z", published: true, front_page: false },
      };
    },
  };
  const result = await pages.handlers.create_page(mockClient, { course_id: 101, title: "About Us", body: "<p>About info</p>", published: true });
  assert.strictEqual(calledUrl, "/api/v1/courses/101/pages");
  assert.deepStrictEqual(calledPayload, { wiki_page: { title: "About Us", body: "<p>About info</p>", published: true } });
  assert.deepStrictEqual(result, {
    page_id: 602,
    url: "about",
    title: "About Us",
    body: "<p>About info</p>",
    updated_at: "2026-07-04T12:00:00Z",
    published: true,
    front_page: false,
  });
});

test("update_page tool calls put with correct payload", async () => {
  let calledUrl = null;
  let calledPayload = null;
  const mockClient = {
    put: async (url, payload) => {
      calledUrl = url;
      calledPayload = payload;
      return {
        data: { page_id: 601, url: "welcome", title: "Welcome Page Updated", body: "<h1>Updated!</h1>", updated_at: "2026-07-04T13:00:00Z", published: true, front_page: true },
      };
    },
  };
  const result = await pages.handlers.update_page(mockClient, { course_id: 101, url_or_id: "welcome", title: "Welcome Page Updated", body: "<h1>Updated!</h1>" });
  assert.strictEqual(calledUrl, "/api/v1/courses/101/pages/welcome");
  assert.deepStrictEqual(calledPayload, { wiki_page: { title: "Welcome Page Updated", body: "<h1>Updated!</h1>" } });
  assert.deepStrictEqual(result, {
    page_id: 601,
    url: "welcome",
    title: "Welcome Page Updated",
    body: "<h1>Updated!</h1>",
    updated_at: "2026-07-04T13:00:00Z",
    published: true,
    front_page: true,
  });
});

test("delete_page tool calls delete endpoint", async () => {
  let calledUrl = null;
  const mockClient = {
    delete: async (url) => {
      calledUrl = url;
      return {
        data: { page_id: 601, url: "welcome", title: "Welcome Page" },
      };
    },
  };
  const result = await pages.handlers.delete_page(mockClient, { course_id: 101, url_or_id: "welcome" });
  assert.strictEqual(calledUrl, "/api/v1/courses/101/pages/welcome");
  assert.deepStrictEqual(result, {
    page_id: 601,
    url: "welcome",
    title: "Welcome Page",
  });
});
