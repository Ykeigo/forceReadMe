import { getRandomRecentArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export default async function Home() {
  const articles = await getRandomRecentArticles(5);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            今週の技術記事
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Zenn / Qiita から直近1週間の記事をランダムに5件表示しています。
          </p>
        </header>

        {articles.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            記事を取得できませんでした。しばらくしてから再度お試しください。
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {articles.map((article) => (
              <li key={article.id} className="py-5 first:pt-0 last:pb-0">
                <div className="mb-1.5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span
                    className={
                      article.source === "Zenn"
                        ? "font-medium text-sky-600 dark:text-sky-400"
                        : "font-medium text-green-700 dark:text-green-400"
                    }
                  >
                    {article.source}
                  </span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={article.publishedAt}>
                    {formatDate(article.publishedAt)}
                  </time>
                </div>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-medium leading-snug text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
                >
                  {article.title}
                </a>
                <p className="mt-1 break-all text-sm text-zinc-500 dark:text-zinc-400">
                  {article.url}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
