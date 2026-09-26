import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Memo } from "@/lib/memos";
import { MemoList } from "./memo-list";

describe("MemoList", () => {
  it("0件なら空状態メッセージを表示する", () => {
    render(<MemoList memos={[]} />);
    expect(
      screen.getByText(
        "まだメモはありません。記事一覧からメモを作成してください。",
      ),
    ).toBeInTheDocument();
  });

  it("本文ありのメモは Markdown を、空本文はプレースホルダを表示する", () => {
    const memos: Memo[] = [
      {
        id: "memo-1",
        userId: "user-1",
        title: "本文あり",
        url: "https://example.com/1",
        body: "## 見出し",
        createdAt: "2026-01-02T12:00:00.000Z",
        updatedAt: "2026-01-02T12:00:00.000Z",
      },
      {
        id: "memo-2",
        userId: "user-1",
        title: "本文なし",
        url: "https://example.com/2",
        body: "   ",
        createdAt: "2026-01-01T12:00:00.000Z",
        updatedAt: "2026-01-01T12:00:00.000Z",
      },
    ];

    render(<MemoList memos={memos} />);

    expect(screen.getByText("本文あり")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "見出し" }),
    ).toBeInTheDocument();
    expect(screen.getByText("（本文なし）")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "https://example.com/1" }),
    ).toHaveAttribute("href", "https://example.com/1");
  });
});
