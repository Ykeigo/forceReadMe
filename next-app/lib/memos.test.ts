import { describe, expect, it } from "vitest";
import {
  buildNewMemoPath,
  createMemoId,
  toMemoDto,
} from "./memos";

describe("createMemoId", () => {
  it("memo- で始まる ID を返す", () => {
    expect(createMemoId()).toMatch(/^memo-/);
  });

  it("連続生成しても異なる ID になる", () => {
    const ids = new Set(Array.from({ length: 20 }, () => createMemoId()));
    expect(ids.size).toBe(20);
  });
});

describe("buildNewMemoPath", () => {
  it("title と url をクエリに載せる", () => {
    const path = buildNewMemoPath("Hello", "https://example.com/post");
    expect(path).toBe(
      "/memos/new?title=Hello&url=https%3A%2F%2Fexample.com%2Fpost",
    );
  });

  it("スペース・日本語・& をエンコードする", () => {
    const path = buildNewMemoPath("読んだ & メモ", "https://example.com/a b");
    const qs = path.slice("/memos/new?".length);
    const params = new URLSearchParams(qs);
    expect(params.get("title")).toBe("読んだ & メモ");
    expect(params.get("url")).toBe("https://example.com/a b");
  });
});

describe("toMemoDto", () => {
  it("Date を ISO 文字列に変換する", () => {
    const createdAt = new Date("2026-01-02T03:04:05.000Z");
    const updatedAt = new Date("2026-01-03T03:04:05.000Z");
    expect(
      toMemoDto({
        id: "memo-1",
        userId: "user-1",
        title: "タイトル",
        url: "https://example.com",
        body: "本文",
        createdAt,
        updatedAt,
      }),
    ).toEqual({
      id: "memo-1",
      userId: "user-1",
      title: "タイトル",
      url: "https://example.com",
      body: "本文",
      createdAt: "2026-01-02T03:04:05.000Z",
      updatedAt: "2026-01-03T03:04:05.000Z",
    });
  });
});
