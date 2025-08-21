import type { Gender } from "./fortune";

export type ReadingPayload = {
  n: string;   // name
  g: Gender;   // gender
  a: number;   // age
  i: number;   // template index (0-9)
  t: number;   // timestamp (ms)
};

function toBase64Url(input: string) {
  const b64 = Buffer.from(input, "utf8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return Buffer.from(b64, "base64").toString("utf8");
}

export function encodeId(p: ReadingPayload) {
  const json = JSON.stringify(p);
  return toBase64Url(json);
}

export function decodeId(id: string): ReadingPayload | null {
  try {
    const json = fromBase64Url(id);
    const obj = JSON.parse(json);
    // kaba doğrulama
    if (!obj || typeof obj.n !== "string" || typeof obj.g !== "string" || typeof obj.a !== "number" || typeof obj.i !== "number")
      return null;
    return obj as ReadingPayload;
  } catch {
    return null;
  }
}
