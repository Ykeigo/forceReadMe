export type Memo = {
  id: string;
  title: string;
  url: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export const MEMO_STORAGE_KEY = "force-readme-memos";

export function createMemoId(): string {
  return `memo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildNewMemoPath(title: string, url: string): string {
  const params = new URLSearchParams({ title, url });
  return `/memos/new?${params.toString()}`;
}

export function loadMemos(): Memo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MEMO_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Memo[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMemos(memos: Memo[]) {
  localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(memos));
}
