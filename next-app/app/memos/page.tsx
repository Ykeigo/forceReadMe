import { MemoList } from "./memo-list";

export default function MemosPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            今までに作成したメモ
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            このブラウザに保存された読書メモ一覧です。
          </p>
        </header>

        <MemoList />
      </main>
    </div>
  );
}
