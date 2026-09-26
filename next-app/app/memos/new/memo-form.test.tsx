import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoForm } from "./memo-form";

const push = vi.fn();
const refresh = vi.fn();
const createMemoActionMock = vi.fn();

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

vi.mock("@/app/actions/memos", () => ({
  createMemoAction: (...args: unknown[]) => createMemoActionMock(...args),
}));

describe("MemoForm", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    createMemoActionMock.mockReset();
  });

  it("title / url が空ならエラーを出して保存しない", async () => {
    const user = userEvent.setup();
    render(<MemoForm initialTitle="" initialUrl="" />);

    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "記事情報が不正です。一覧から再度開き直してください。",
    );
    expect(createMemoActionMock).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("正常送信で server action を呼び /memos へ遷移する", async () => {
    const user = userEvent.setup();
    createMemoActionMock.mockResolvedValue({
      ok: true,
      memo: {
        id: "memo-1",
        userId: "user-1",
        title: "新しい記事",
        url: "https://example.com/new",
        body: "## 要点",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });

    render(
      <MemoForm
        initialTitle=" 新しい記事 "
        initialUrl=" https://example.com/new "
      />,
    );

    await user.type(screen.getByLabelText("メモ（Markdown）"), "## 要点");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(createMemoActionMock).toHaveBeenCalledWith({
      title: " 新しい記事 ",
      url: " https://example.com/new ",
      body: "## 要点",
    });
    expect(push).toHaveBeenCalledWith("/memos");
    expect(refresh).toHaveBeenCalled();
  });

  it("保存失敗時にエラーを出す", async () => {
    const user = userEvent.setup();
    createMemoActionMock.mockResolvedValue({
      ok: false,
      error: "SAVE_FAILED",
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