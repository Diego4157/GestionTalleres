import { headers } from "next/headers";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, Bucket>();

/** IP del cliente detrás del proxy de Vercel / reverse proxy. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

function memoryLimit(key: string, limit: number, windowSec: number): RateLimitResult {
  const now = Date.now();

  // Limpieza oportunista para que el Map no crezca indefinidamente.
  if (memoryStore.size > 5000) {
    for (const [k, b] of memoryStore) {
      if (b.resetAt <= now) memoryStore.delete(k);
    }
  }

  const bucket = memoryStore.get(key);
  if (!bucket || bucket.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { allowed: true, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { allowed: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSec: 0 };
}

async function upstashLimit(key: string, limit: number, windowSec: number): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSec, "NX"],
      ]),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: number }[];
    const count = Number(data?.[0]?.result ?? 0);
    if (!count) return null;
    return count > limit
      ? { allowed: false, retryAfterSec: windowSec }
      : { allowed: true, retryAfterSec: 0 };
  } catch {
    return null;
  }
}

/**
 * Limita `limit` peticiones por `windowSec` segundos para la clave dada.
 * Usa Upstash Redis si está configurado (válido entre instancias serverless);
 * de lo contrario o ante un fallo, usa un contador en memoria por instancia.
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<RateLimitResult> {
  const distributed = await upstashLimit(key, limit, windowSec);
  if (distributed) return distributed;
  return memoryLimit(key, limit, windowSec);
}
