import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

export const runtime = "nodejs";

type Card = { id: string; name: string; imageUrl: string };
type SetGroup = { setId: string; logoUrl: string; cards: Card[] };

const MEMORY_TTL_SECONDS = 2592000;
const memoryCache = new Map<string, { expiresAtMs: number; value: { sets: SetGroup[] } }>();

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function isAbortError(err: unknown) {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as any).name === "AbortError"
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") || "").trim();
  const normalizedQuery = query.toLowerCase();

  if (!query) {
    return NextResponse.json({ sets: [] });
  }

  const apiKey = "86a793871318efc780444ea7256b09248c96eea835564fac60021da95836a59b";
  const upstreamUrl = `https://apitcg.com/api/pokemon/cards?name=${encodeURIComponent(query)}`;

  const cachedMemory = memoryCache.get(normalizedQuery);
  if (cachedMemory && cachedMemory.expiresAtMs > Date.now()) {
    return NextResponse.json(cachedMemory.value, {
      headers: {
        "Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=86400",
        "X-Tcg-Cache": "HIT",
      },
    });
  }

  const getSetsForQuery = unstable_cache(
    async () => {
      const init: RequestInit = {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "Accept": "application/json",
          "User-Agent": "pkmtracker-v2",
        },
      };

      const timeoutMs = 20000;
      let res: Response;

      try {
        res = await fetchWithTimeout(upstreamUrl, init, timeoutMs);
      } catch (e) {
        if (isAbortError(e)) {
          return { error: "TCG API request timed out", status: 504 };
        }

        try {
          res = await fetchWithTimeout(upstreamUrl, init, timeoutMs);
        } catch (e2) {
          if (isAbortError(e2)) {
            return { error: "TCG API request timed out", status: 504 };
          }
          throw e2;
        }
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return {
          error: `TCG API error (${res.status}) ${text}`,
          status: res.status,
        };
      }

      const json: any = await res.json();
      const cards = (json?.data || []) as any[];

      const normalizedCards = cards.slice(0, 60).map((c) => ({
        id: String(c.id),
        name: String(c.name || ""),
        imageUrl: String(c.images?.large || c.images?.small || ""),
      }));

      const setMap = new Map<
        string,
        {
          setId: string;
          logoUrl: string;
          cards: { id: string; name: string; imageUrl: string }[];
        }
      >();

      for (const card of normalizedCards) {
        const setId = card.id.split("-")[0];
        if (!setId) continue;

        const existing = setMap.get(setId);
        if (existing) {
          existing.cards.push(card);
          continue;
        }

        setMap.set(setId, {
          setId,
          logoUrl: `https://images.pokemontcg.io/${setId}/symbol.png`,
          cards: [card],
        });
      }

      return { sets: Array.from(setMap.values()) };
    },
    ["tcg-cards", normalizedQuery],
    { revalidate: 2592000 }
  );

  try {
    const cached = await getSetsForQuery();

    if ("error" in cached) {
      return NextResponse.json({ error: cached.error }, { status: cached.status });
    }

    memoryCache.set(normalizedQuery, {
      expiresAtMs: Date.now() + MEMORY_TTL_SECONDS * 1000,
      value: cached,
    });

    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=86400",
        "X-Tcg-Cache": "MISS",
      },
    });
  } catch (e: any) {
    if (isAbortError(e)) {
      return NextResponse.json(
        { error: "TCG API request timed out" },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: e?.message || "Failed to fetch cards" },
      { status: 500 }
    );
  }
}
