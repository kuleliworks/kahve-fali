// lib/redis.ts
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Env yoksa no-op client: zrange=[] / hgetall=null döndürür
const fallback = {
  async zrange() { return []; },
  async hgetall() { return null as any; },
} as unknown as Redis;

export const redis =
  url && token ? new Redis({ url, token }) : fallback;
