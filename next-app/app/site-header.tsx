import Link from "next/link";
import { AuthControls } from "./auth-controls";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-6 py-3">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
        >
          今週の技術記事
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/memos"
            className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            今までに作成したメモ
          </Link>
          <AuthControls />
        </nav>
      </div>
    </header>
  );
}
