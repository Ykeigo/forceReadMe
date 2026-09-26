export type Article = {
  id: string;
  title: string;
  url: string;
  source: "Zenn" | "Qiita";
  publishedAt: string;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ARTICLE_COUNT = 5;

function weekAgoIsoDate(): string {
  const d = new Date(Date.now() - WEEK_MS);
  return d.toISOString().slice(0, 10);
}

function isWithinLastWeek(iso: string): boolean {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t >= Date.now() - WEEK_MS;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type ZennArticle = {
  id: number;
  title: string;
  path: string;
  published_at: string;
};

type ZennResponse = {
  articles: ZennArticle[];
  next_page: number | null;
};

async function fetchZenn(): Promise<Article[]> {
  const since = Date.now() - WEEK_MS;
  const results: Article[] = [];

  for (let page = 1; page <= 5; page++) {
    const res = await fetch(
      `https://zenn.dev/api/articles?order=latest&page=${page}`,
      { next: { revalidate: 0 } },
    );
    if (!res.ok) break;

    const data = (await res.json()) as ZennResponse;
    for (const a of data.articles ?? []) {
      const published = new Date(a.published_at).getTime();
      if (!Number.isFinite(published) || published < since) {
        return results;
      }
      results.push({
        id: `zenn-${a.id}`,
        title: a.title,
        url: `https://zenn.dev${a.path}`,
        source: "Zenn",
        publishedAt: a.published_at,
      });
    }

    if (!data.next_page) break;
  }

  return results;
}

type QiitaItem = {
  id: string;
  title: string;
  url: string;
  created_at: string;
};

async function fetchQiita(): Promise<Article[]> {
  const query = encodeURIComponent(`created:>${weekAgoIsoDate()}`);
  const res = await fetch(
    `https://qiita.com/api/v2/items?page=1&per_page=100&query=${query}`,
    {
      headers: {
        Accept: "application/json",
        ...(process.env.QIITA_ACCESS_TOKEN
          ? { Authorization: `Bearer ${process.env.QIITA_ACCESS_TOKEN}` }
          : {}),
      },
      next: { revalidate: 0 },
    },
  );
  if (!res.ok) return [];

  const items = (await res.json()) as QiitaItem[];
  return (items ?? [])
    .filter((a) => isWithinLastWeek(a.created_at))
    .map((a) => ({
      id: `qiita-${a.id}`,
      title: a.title,
      url: a.url,
      source: "Qiita" as const,
      publishedAt: a.created_at,
    }));
}

/** 直近1週間の Zenn / Qiita 記事からランダムに最大5件返す */
export async function getRandomRecentArticles(
  count = ARTICLE_COUNT,
): Promise<Article[]> {
  const settled = await Promise.allSettled([fetchZenn(), fetchQiita()]);
  const pool: Article[] = [];

  for (const result of settled) {
    if (result.status === "fulfilled") {
      pool.push(...result.value);
    }
  }

  return shuffle(pool).slice(0, count);
}
