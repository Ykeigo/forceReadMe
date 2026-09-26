export type Memo = {
  id: string;
  userId: string;
  title: string;
  url: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateMemoInput = {
  title: string;
  url: string;
  body: string;
};

export function createMemoId(): string {
  return `memo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildNewMemoPath(title: string, url: string): string {
  const params = new URLSearchParams({ title, url });
  return `/memos/new?${params.toString()}`;
}

export function toMemoDto(row: {
  id: string;
  userId: string;
  title: string;
  url: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}): Memo {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    url: row.url,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
