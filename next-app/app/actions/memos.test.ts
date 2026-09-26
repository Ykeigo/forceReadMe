import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "next-auth";
import { createMemoAction } from "@/app/actions/memos";

const authMock = vi.fn();
const createMemoForUserMock = vi.fn();

vi.mock("@/auth", () => ({
  auth: (...args: unknown[]) => authMock(...args),
}));

vi.mock("@/lib/memo-store", () => ({
  createMemoForUser: (...args: unknown[]) => createMemoForUserMock(...args),
}));

function sessionFor(userId: string): Session {
  return {
    user: { id: userId, email: "a@example.com" },
    expires: "2099-01-01T00:00:00.000Z",
  };
}

describe("createMemoAction", () => {
  beforeEach(() => {
    authMock.mockReset();
    createMemoForUserMock.mockReset();
  });

  it("未ログインなら UNAUTHENTICATED", async () => {
    authMock.mockResolvedValue(null);

    const result = await createMemoAction({
      title: "記事",
      url: "https://example.com",
      body: "",
    });

    expect(result).toEqual({ ok: false, error: "UNAUTHENTICATED" });
    expect(createMemoForUserMock).not.toHaveBeenCalled();
  });

  it("ログイン済みならメモを作成する", async () => {
    authMock.mockResolvedValue(sessionFor("user-1"));
    createMemoForUserMock.mockResolvedValue({
      id: "memo-1",
      userId: "user-1",
      title: "記事",
      url: "https://example.com",
      body: "## 要点",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const result = await createMemoAction({
      title: "記事",
      url: "https://example.com",
      body: "## 要点",
    });

    expect(createMemoForUserMock).toHaveBeenCalledWith("user-1", {
      title: "記事",
      url: "https://example.com",
      body: "## 要点",
    });
    expect(result).toMatchObject({ ok: true, memo: { id: "memo-1" } });
  });

  it("INVALID_ARTICLE をエラーコードに変換する", async () => {
    authMock.mockResolvedValue(sessionFor("user-1"));
    createMemoForUserMock.mockRejectedValue(new Error("INVALID_ARTICLE"));

    const result = await createMemoAction({
      title: "",
      url: "",
      body: "",
    });

    expect(result).toEqual({ ok: false, error: "INVALID_ARTICLE" });
  });
});
