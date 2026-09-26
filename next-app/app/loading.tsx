export default function Loading() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <header className="mb-10">
          <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </header>
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800" aria-hidden>
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="animate-pulse py-5 first:pt-0 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-5 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="h-8 w-20 shrink-0 rounded-md bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
