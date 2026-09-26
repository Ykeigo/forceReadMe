"use server";

import { auth } from "@/auth";
import { createMemoForUser } from "@/lib/memo-store";
import type { CreateMemoInput, Memo } from "@/lib/memos";

export type CreateMemoResult =
  | { ok: true; memo: Memo }
  | { ok: false; error: "UNAUTHENTICATED" | "INVALID_ARTICLE" | "SAVE_FAILED" };

export async function createMemoAction(
  input: CreateMemoInput,
): Promise<CreateMemoResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, error: "UNAUTHENTICATED" };
  }

  try {
    const memo = await createMemoForUser(userId, input);
    return { ok: true, memo };
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ARTICLE") {
      return { ok: false, error: "INVALID_ARTICLE" };
    }
    return { ok: false, error: "SAVE_FAILED" };
  }
}
