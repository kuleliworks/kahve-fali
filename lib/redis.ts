// lib/redis.ts
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Env var yoksa import anında patlatmak yerine,
// "kullanıldığında" patlatan bir proxy export ediyoruz.
// Böylece build/import çalışır; çağrı anında net hata alınır.
let client: Redis | null = null;
if (url && token) {
  client = new Redis({ url, token });
}

function misconfigured(): never {
  throw new Error(
    "Upstash Redis yapılandırılmamış. Vercel > Settings > Environment Variables altına " +
      "UPSTASH_REDIS_REST_URL ve UPSTASH_REDIS_REST_TOKEN ekleyin."
  );
}

export const redis: Redis =
  client ??
  (new Proxy(
    {},
    {
      get() {
        misconfigured();
      },
      apply() {
        misconfigured();
      },
    }
  ) as unknown as Redis);

// İsteyen yerlerde kontrol edebilmek için:
export const hasRedis = !!client;
