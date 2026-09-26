import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MEMO_STORAGE_KEY,
  buildNewMemoPath,
  createMemoId,
  loadMemos,
  saveMemos,
  type Memo,
} from "./memos";

function sampleMemo(overrides: Partial<Memo> = {}): Memo {
  return {
    id: "memo-1",
    title: "サンプル",
    url: "https://example.com/a",
    body: "## 要点",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

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

describe("loadMemos / saveMemos", () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("未保存なら空配列を返す", () => {
    expect(loadMemos()).toEqual([]);
  });

  it("保存したメモを読み戻せる", () => {
    const memos = [sampleMemo()];
    saveMemos(memos);
    expect(loadMemos()).toEqual(memos);
    expect(localStorage.getItem(MEMO_STORAGE_KEY)).toBe(JSON.stringify(memos));
  });

  it("壊れた JSON なら空配列を返す", () => {
    localStorage.setItem(MEMO_STORAGE_KEY, "{not-json");
    expect(loadMemos()).toEqual([]);
  });

  it("配列以外の JSON なら空配列を返す", () => {
    localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify({ id: "x" }));
    expect(loadMemos()).toEqual([]);
  });

  it("window が無い環境では空配列を返す", () => {
    vi.stubGlobal("window", undefined);
    expect(loadMemos()).toEqual([]);
  });
});
