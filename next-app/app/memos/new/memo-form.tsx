"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  createMemoId,
  loadMemos,
  saveMemos,
  type Memo,
} from "@/lib/memos";

type Props = {
  initialTitle: string;
  initialUrl: string;
};

export function MemoForm({ initialTitle, initialUrl }: Props) {
  const router = useRouter();
  const title = initialTitle;
  const url = initialUrl;
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !url.trim()) {
      setError("記事情報が不正です。一覧から再度開き直してください。");
      return;
    }

    setSaving(true);
    const now = new Date().toISOString();
    const memo: Memo = {
      id: createMemoId(),
      title: title.trim(),
      url: url.trim(),
      body,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const memos = loadMemos();
      memos.unshift(memo);
      saveMemos(memos);
      router.push("/memos");
      router.refresh();
    } catch {
      setError("保存に失敗しました。");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          タイトル
        </p>
        <p className="text-zinc-900 dark:text-zinc-50">{title || "—"}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          記事URL
        </p>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-mono text-sm text-sky-700 underline-offset-4 hover:underline dark:text-sky-400"
          >
            {url}
          </a>
        ) : (
          <p className="text-zinc-500 dark:text-zinc-400">—</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="memo-body"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          メモ（Markdown）
        </label>
        <textarea
          id="memo-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={16}
          placeholder={"## 要点\n\n- \n\n## 感想\n\n"}
          className="resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm leading-relaxed text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
        />
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {saving ? "保存中…" : "保存する"}
        </button>
        <Link
          href="/"
          className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
