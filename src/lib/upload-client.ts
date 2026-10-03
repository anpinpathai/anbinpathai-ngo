import { admin } from "@/content/admin-en";
import { resizeImage } from "@/lib/image-resize";

export type UploadErrorCode = "unsupported" | "not_configured" | "failed";

export class UploadError extends Error {
  constructor(public code: UploadErrorCode) {
    super(code);
  }
}

export function uploadErrorMessage(err: unknown) {
  const code = err instanceof UploadError ? err.code : "failed";
  if (code === "unsupported") return admin.uploader.unsupported;
  if (code === "not_configured") return admin.uploader.notConfigured;
  return admin.uploader.failed;
}

export async function uploadImage(file: File, maxSide: number): Promise<{ key: string; url: string }> {
  let blob: Blob;
  try {
    blob = await resizeImage(file, maxSide);
  } catch {
    throw new UploadError("unsupported");
  }
  return uploadBlob(blob);
}

// Fetches a photo that is already saved, through this website, so the Adjust window can edit it.
export async function fetchStoredImage(key: string): Promise<Blob> {
  let res: Response;
  try {
    res = await fetch(`/api/admin/image?key=${encodeURIComponent(key)}`);
  } catch {
    throw new UploadError("failed");
  }
  if (!res.ok) throw new UploadError("failed");
  return res.blob();
}

// Uploads a photo that is already the right size (for example one made in the Adjust window).
export async function uploadBlob(blob: Blob): Promise<{ key: string; url: string }> {
  const body = new FormData();
  body.append("file", blob, "upload");

  let res: Response;
  try {
    res = await fetch("/api/admin/upload", { method: "POST", body });
  } catch {
    throw new UploadError("failed");
  }

  const data = (await res.json().catch(() => ({}))) as { key?: string; url?: string; error?: string };
  if (!res.ok || !data.key || !data.url) {
    throw new UploadError(
      data.error === "unsupported" ? "unsupported" : data.error === "not_configured" ? "not_configured" : "failed",
    );
  }
  return { key: data.key, url: data.url };
}
