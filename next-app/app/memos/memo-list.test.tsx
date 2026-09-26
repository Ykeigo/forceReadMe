import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MEMO_STORAGE_KEY, type Memo } from "@/lib/memos";
import { MemoList } from "./memo-list";

describe("MemoList", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("0件なら空状態メッセージを表示する", async () => {
    render(<MemoList />);
    expect(
      await screen.findByText(
        "まだメモはありません。記事一覧からメモを作成してください。",
      ),
    ).toBeInTheDocument();
  });

  it("本文ありのメモは Markdown を、空本文はプレースホルダを表示する", async () => {
    const memos: Memo[] = [
      {
        id: "memo-1",
        title: "本文あり",
        url: "https://example.com/1",
        body: "## 見出し",
        createdAt: "2026-01-02T12:00:00.000Z",
        updatedAt: "2026-01-02T12:00:00.000Z",
      },
      {
        id: "memo-2",
        title: "本文なし",
        url: "https://example.com/2",
        body: "   ",
        createdAt: "2026-01-01T12:00:00.000Z",
        updatedAt: "2026-01-01T12:00:00.000Z",
      },
    ];
    localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(memos));

    render(<MemoList />);

    expect(await screen.findByText("本文あり")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "見出し" }),
    ).toBeInTheDocument();
    expect(screen.getByText("（本文なし）")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "https://example.com/1" }),
    ).toHaveAttribute("href", "https://example.com/1");
  });
});
