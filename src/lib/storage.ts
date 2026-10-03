import "server-only";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { AwsClient } from "aws4fetch";

const KEY_PATTERN = /^uploads\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.(webp|jpg|png)$/;
const LOCAL_DIR = path.join(process.cwd(), "public", "dev-uploads");

export class StorageNotConfiguredError extends Error {
  constructor() {
    super("Photo storage is not configured. Set the R2_* environment variables.");
  }
}

export function isValidKey(key: string) {
  return KEY_PATTERN.test(key);
}

function r2Config() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env;
  const values = [R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL];
  if (values.some((v) => !v || v.toLowerCase().startsWith("dummy"))) return null;
  return {
    accountId: R2_ACCOUNT_ID!,
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
    bucket: R2_BUCKET!,
    publicUrl: R2_PUBLIC_URL!.replace(/\/+$/, ""),
  };
}

function driver(): "r2" | "local" {
  if (r2Config()) return "r2";
  if (process.env.NODE_ENV !== "production") return "local";
  throw new StorageNotConfiguredError();
}

function r2Request(cfg: NonNullable<ReturnType<typeof r2Config>>, key: string, init: RequestInit) {
  const client = new AwsClient({
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
    service: "s3",
    region: "auto",
  });
  return client.fetch(`https://${cfg.accountId}.r2.cloudflarestorage.com/${cfg.bucket}/${key}`, init);
}

export async function putObject(key: string, body: Uint8Array, contentType: string) {
  if (!isValidKey(key)) throw new Error("Invalid storage key");

  if (driver() === "r2") {
    const res = await r2Request(r2Config()!, key, {
      method: "PUT",
      body: body as BodyInit,
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000, immutable" },
    });
    if (!res.ok) throw new Error(`R2 upload failed with status ${res.status}`);
    return;
  }

  const file = path.join(LOCAL_DIR, key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);
}

export async function deleteObject(key: string) {
  if (!isValidKey(key)) return;

  if (driver() === "r2") {
    const res = await r2Request(r2Config()!, key, { method: "DELETE" });
    if (!res.ok && res.status !== 404) throw new Error(`R2 delete failed with status ${res.status}`);
    return;
  }

  await unlink(path.join(LOCAL_DIR, key)).catch(() => undefined);
}

export async function deleteObjects(keys: (string | null | undefined)[]) {
  const results = await Promise.allSettled(keys.filter((k): k is string => Boolean(k)).map((k) => deleteObject(k)));
  for (const r of results) if (r.status === "rejected") console.error("Deleting a stored file failed:", r.reason);
}

export function publicUrl(key: string | null | undefined) {
  if (!key || !isValidKey(key)) return null;
  const cfg = r2Config();
  if (cfg) return `${cfg.publicUrl}/${key}`;
  return `/dev-uploads/${key}`;
}
