import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MEMO_STORAGE_KEY, type Memo } from "@/lib/memos";
import { MemoForm } from "./memo-form";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("MemoForm", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockReset();
    refresh.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("title / url が空ならエラーを出して保存しない", async () => {
    const user = userEvent.setup();
    render(<MemoForm initialTitle="" initialUrl="" />);

    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "記事情報が不正です。一覧から再度開き直してください。",
    );
    expect(localStorage.getItem(MEMO_STORAGE_KEY)).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it("正常送信でメモを先頭追加して /memos へ遷移する", async () => {
    const user = userEvent.setup();
    const existing: Memo = {
      id: "memo-old",
      title: "既存",
      url: "https://example.com/old",
      body: "old",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify([existing]));

    render(
      <MemoForm
        initialTitle=" 新しい記事 "
        initialUrl=" https://example.com/new "
      />,
    );

    await user.type(screen.getByLabelText("メモ（Markdown）"), "## 要点");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    const saved = JSON.parse(
      localStorage.getItem(MEMO_STORAGE_KEY) ?? "[]",
    ) as Memo[];
    expect(saved).toHaveLength(2);
    expect(saved[0]).toMatchObject({
      title: "新しい記事",
      url: "https://example.com/new",
      body: "## 要点",
    });
    expect(saved[0].id).toMatch(/^memo-/);
    expect(saved[1].id).toBe("memo-old");
    expect(push).toHaveBeenCalledWith("/memos");
    expect(refresh).toHaveBeenCalled();
  });

  it("localStorage 書き込み失敗時にエラーを出す", async () => {
    const user = userEvent.setup();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });

    render(
      <MemoForm
        initialTitle="記事"
        initialUrl="https://example.com/a"
      />,
    );

    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(screen.getByRole("alert")).toHaveTextContent("保存に失敗しました。");
    expect(push).not.toHaveBeenCalled();
  });
});
