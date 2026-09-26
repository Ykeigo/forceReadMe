import { MarkdownBody } from "@/components/markdown-body";
import type { Memo } from "@/lib/memos";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

type Props = {
  memos: Memo[];
};

export function MemoList({ memos }: Props) {
  if (memos.length === 0) {
    return (
      <p className="text-zinc-600 dark:text-zinc-400">
        まだメモはありません。記事一覧からメモを作成してください。
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {memos.map((memo) => (
        <li key={memo.id} className="py-6 first:pt-0 last:pb-0">
          <time
            dateTime={memo.createdAt}
            className="text-xs text-zinc-500 dark:text-zinc-400"
          >
            {formatDate(memo.createdAt)}
          </time>
          <h2 className="mt-1 text-lg font-medium text-zinc-900 dark:text-zinc-50">
            {memo.title}
          </h2>
          <a
            href={memo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block break-all font-mono text-sm text-sky-700 underline-offset-4 hover:underline dark:text-sky-400"
          >
            {memo.url}
          </a>
          {memo.body.trim() ? (
            <MarkdownBody content={memo.body} className="mt-4" />
          ) : (
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              （本文なし）
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
