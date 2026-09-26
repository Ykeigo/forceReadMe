/** @vitest-environment node */
import { execSync } from "node:child_process";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/test.db";

beforeAll(() => {
  execSync("pnpm exec prisma db push --skip-generate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
});

const { prisma } = await import("@/lib/db");
const { createMemoForUser, listMemosForUser } = await import("@/lib/memo-store");

const userA = "user-a";
const userB = "user-b";

describe("memo-store", () => {
  beforeEach(async () => {
    await prisma.memo.deleteMany();
  });

  afterAll(async () => {
    await prisma.memo.deleteMany();
    await prisma.$disconnect();
  });

  it("メモを作成して一覧で新しい順に返す", async () => {
    const first = await createMemoForUser(userA, {
      title: "古い",
      url: "https://example.com/old",
      body: "1",
    });
    const second = await createMemoForUser(userA, {
      title: "新しい",
      url: "https://example.com/new",
      body: "2",
    });

    const listed = await listMemosForUser(userA);
    expect(listed.map((m) => m.id)).toEqual([second.id, first.id]);
    expect(listed[0]).toMatchObject({
      userId: userA,
      title: "新しい",
      url: "https://example.com/new",
      body: "2",
    });
  });

  it("他ユーザーのメモは一覧に出ない", async () => {
    await createMemoForUser(userA, {
      title: "Aのメモ",
      url: "https://example.com/a",
      body: "",
    });
    await createMemoForUser(userB, {
      title: "Bのメモ",
      url: "https://example.com/b",
      body: "",
    });

    const listed = await listMemosForUser(userA);
    expect(listed).toHaveLength(1);
    expect(listed[0].title).toBe("Aのメモ");
  });

  it("title / url が空なら INVALID_ARTICLE", async () => {
    await expect(
      createMemoForUser(userA, {
        title: "  ",
        url: "https://example.com",
        body: "",
      }),
    ).rejects.toThrow("INVALID_ARTICLE");
  });
});
