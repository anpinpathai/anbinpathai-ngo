import { getSession } from "@/lib/session";
import { getObject, isValidKey, StorageNotConfiguredError } from "@/lib/storage";

// Hands a saved photo back to the signed-in admin's own browser, so the Adjust window can edit it.
// (The public photo address is another website, and a browser will not let a page edit those pixels.)
export async function GET(request: Request) {
  if (!(await getSession())) return Response.json({ error: "unauthorized" }, { status: 401 });

  const key = new URL(request.url).searchParams.get("key") ?? "";
  if (!isValidKey(key)) return Response.json({ error: "invalid" }, { status: 400 });

  try {
    const object = await getObject(key);
    if (!object) return Response.json({ error: "not_found" }, { status: 404 });
    return new Response(object.body as BodyInit, {
      headers: {
        "Content-Type": object.contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Reading a saved photo failed:", err);
    return Response.json(
      { error: err instanceof StorageNotConfiguredError ? "not_configured" : "failed" },
      { status: 500 },
    );
  }
}
