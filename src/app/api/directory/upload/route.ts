import { randomUUID } from "node:crypto";
import { UPLOAD_LIMIT, countOne, tooMany, visitorKey } from "@/lib/directory/spam";
import { directoryEnabled, directoryOpen } from "@/lib/directory/text";
import { getSettings } from "@/lib/settings";
import { publicUrl, putObject, StorageNotConfiguredError } from "@/lib/storage";

// The photo upload for the public registration form. Anyone can use it while registrations are open, so it is
// strict: only a real photo, small, and only a few uploads from one visitor.

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

  const settings = await getSettings();
  if (!directoryEnabled(settings) || !directoryOpen(settings)) return fail("closed", 403);

  const key = await visitorKey("upload");
  if (await tooMany(key, UPLOAD_LIMIT)) return fail("too_many", 429);

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

  await countOne(key);

  const now = new Date();
  const storageKey = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${type.ext}`;

  try {
    await putObject(storageKey, bytes, type.mime);
  } catch (err) {
    console.error("Registry photo upload failed:", err);
    return fail(err instanceof StorageNotConfiguredError ? "not_configured" : "upload_failed", 500);
  }

  return Response.json({ key: storageKey, url: publicUrl(storageKey) });
}
