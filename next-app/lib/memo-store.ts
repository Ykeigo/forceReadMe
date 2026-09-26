import { prisma } from "@/lib/db";
import {
  createMemoId,
  toMemoDto,
  type CreateMemoInput,
  type Memo,
} from "@/lib/memos";

export async function listMemosForUser(userId: string): Promise<Memo[]> {
  const rows = await prisma.memo.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toMemoDto);
}

export async function createMemoForUser(
  userId: string,
  input: CreateMemoInput,
): Promise<Memo> {
  const title = input.title.trim();
  const url = input.url.trim();
  if (!title || !url) {
    throw new Error("INVALID_ARTICLE");
  }

  const row = await prisma.memo.create({
    data: {
      id: createMemoId(),
      userId,
      title,
      url,
      body: input.body,
    },
  });
  return toMemoDto(row);
}
