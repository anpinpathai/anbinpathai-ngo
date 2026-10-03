import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/session";
import { publicUrl, putObject, StorageNotConfiguredError } from "@/lib/storage";

const MAX_BYTES = 3 * 1024 * 1024;

function detectType(bytes: Uint8Array) {
  const startsWith = (sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b);
  if (startsWith([0x89, 0x50, 0x4e, 0x47])) return { ext: "png", mime: "image/png" };
  if (startsWith([0xff, 0xd8, 0xff])) return { ext: "jpg", mime: "image/jpeg" };
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) {
    return { ext: "webp", mime: "image/webp" };
  }
  return null;
}

function fail(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    let originHost: string | null = null;
    try {
      originHost = new URL(origin).host;
    } catch {}
    if (originHost !== request.headers.get("host")) return fail("forbidden", 403);
  }

  if (!(await getSession())) return fail("unauthorized", 401);

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES + 64 * 1024) return fail("too_large", 413);

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return fail("invalid", 400);
  }
  if (!(file instanceof Blob)) return fail("invalid", 400);
  if (file.size === 0 || file.size > MAX_BYTES) return fail("too_large", 413);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectType(bytes);
  if (!type) return fail("unsupported", 415);

  const now = new Date();
  const key = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${type.ext}`;

  try {
    await putObject(key, bytes, type.mime);
  } catch (err) {
    console.error("Photo upload failed:", err);
    return fail(err instanceof StorageNotConfiguredError ? "not_configured" : "upload_failed", 500);
  }

  return Response.json({ key, url: publicUrl(key) });
}
