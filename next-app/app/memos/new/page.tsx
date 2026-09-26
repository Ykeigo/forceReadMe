import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MemoForm } from "./memo-form";

type SearchParams = Promise<{
  title?: string | string[];
  url?: string | string[];
}>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function NewMemoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    const params = await searchParams;
    const title = first(params.title);
    const url = first(params.url);
    const returnTo = new URLSearchParams();
    if (title) returnTo.set("title", title);
    if (url) returnTo.set("url", url);
    const path = returnTo.size
      ? `/memos/new?${returnTo.toString()}`
      : "/memos/new";
    redirect(`/login?callbackUrl=${encodeURIComponent(path)}`);
  }

  const params = await searchParams;
  const title = first(params.title);
  const url = first(params.url);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            ← 記事一覧へ
          </Link>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            読書メモを作成
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            記事の情報を確認し、Markdown でメモを書いてください。アカウントにオンライン保存されます。
          </p>
        </div>

        <MemoForm initialTitle={title} initialUrl={url} />
      </main>
    </div>
  );
}
