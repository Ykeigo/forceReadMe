import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

import { getRandomRecentArticles, type Article } from "./articles";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function jsonResponse(data: unknown, ok = true): Response {
  return {
    ok,
    json: async () => data,
  } as Response;
}

function zennPage(
  articles: Array<{
    id: number;
    title: string;
    path: string;
    published_at: string;
  }>,
  next_page: number | null = null,
) {
  return { articles, next_page };
}

describe("getRandomRecentArticles", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    delete process.env.QIITA_ACCESS_TOKEN;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function mockApis(options: {
    zenn?: ReturnType<typeof zennPage> | null;
    qiita?: Array<{
      id: string;
      title: string;
      url: string;
      created_at: string;
    }>;
    zennOk?: boolean;
    qiitaOk?: boolean;
  }) {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("zenn.dev")) {
        if (options.zennOk === false) return jsonResponse({}, false);
        return jsonResponse(options.zenn ?? zennPage([], null));
      }
      if (url.includes("qiita.com")) {
        if (options.qiitaOk === false) return jsonResponse({}, false);
        return jsonResponse(options.qiita ?? []);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
  }

  it("Zenn / Qiita を Article 形にマッピングする", async () => {
    const published = isoDaysAgo(1);
    mockApis({
      zenn: zennPage([
        {
          id: 10,
          title: "Zenn記事",
          path: "/u/p/abc",
          published_at: published,
        },
      ]),
      qiita: [
        {
          id: "q1",
          title: "Qiita記事",
          url: "https://qiita.com/u/items/q1",
          created_at: published,
        },
      ],
    });

    const articles = await getRandomRecentArticles(10);
    expect(articles).toEqual(
      expect.arrayContaining<Article>([
        {
          id: "zenn-10",
          title: "Zenn記事",
          url: "https://zenn.dev/u/p/abc",
          source: "Zenn",
          publishedAt: published,
        },
        {
          id: "qiita-q1",
          title: "Qiita記事",
          url: "https://qiita.com/u/items/q1",
          source: "Qiita",
          publishedAt: published,
        },
      ]),
    );
    expect(articles).toHaveLength(2);
  });

  it("直近1週間より古い記事は含めない", async () => {
    mockApis({
      zenn: zennPage([
        {
          id: 1,
          title: "古いZenn",
          path: "/u/p/old",
          published_at: isoDaysAgo(10),
        },
      ]),
      qiita: [
        {
          id: "old",
          title: "古いQiita",
          url: "https://qiita.com/u/items/old",
          created_at: new Date(Date.now() - WEEK_MS - 1000).toISOString(),
        },
        {
          id: "new",
          title: "新しいQiita",
          url: "https://qiita.com/u/items/new",
          created_at: isoDaysAgo(2),
        },
      ],
    });

    const articles = await getRandomRecentArticles(10);
    expect(articles.map((a) => a.id)).toEqual(["qiita-new"]);
  });

  it("件数は count を超えない", async () => {
    const published = isoDaysAgo(1);
    mockApis({
      zenn: zennPage(
        Array.from({ length: 3 }, (_, i) => ({
          id: i + 1,
          title: `Z${i}`,
          path: `/u/p/${i}`,
          published_at: published,
        })),
      ),
      qiita: Array.from({ length: 3 }, (_, i) => ({
        id: `q${i}`,
        title: `Q${i}`,
        url: `https://qiita.com/u/items/q${i}`,
        created_at: published,
      })),
    });

    const articles = await getRandomRecentArticles(2);
    expect(articles).toHaveLength(2);
  });

  it("プールが count 未満でも全件返す", async () => {
    mockApis({
      zenn: zennPage([
        {
          id: 1,
          title: "Only",
          path: "/u/p/1",
          published_at: isoDaysAgo(1),
        },
      ]),
      qiita: [],
    });

    const articles = await getRandomRecentArticles(5);
    expect(articles).toHaveLength(1);
  });

  it("片方の API が失敗してももう片方の結果を返す", async () => {
    mockApis({
      zennOk: false,
      qiita: [
        {
          id: "q1",
          title: "Qiitaのみ",
          url: "https://qiita.com/u/items/q1",
          created_at: isoDaysAgo(1),
        },
      ],
    });

    const articles = await getRandomRecentArticles(5);
    expect(articles).toEqual([
      expect.objectContaining({ id: "qiita-q1", source: "Qiita" }),
    ]);
  });

  it("両方失敗なら空配列を返す", async () => {
    mockApis({ zennOk: false, qiitaOk: false });
    await expect(getRandomRecentArticles()).resolves.toEqual([]);
  });

  it("Qiita トークンがあるとき Authorization を付ける", async () => {
    process.env.QIITA_ACCESS_TOKEN = "secret-token";
    mockApis({ zenn: zennPage([]), qiita: [] });

    await getRandomRecentArticles();

    const qiitaCall = vi
      .mocked(fetch)
      .mock.calls.find(([input]) => String(input).includes("qiita.com"));
    expect(qiitaCall).toBeDefined();
    const init = qiitaCall?.[1] as RequestInit;
    expect(init.headers).toMatchObject({
      Accept: "application/json",
      Authorization: "Bearer secret-token",
    });
  });
});
