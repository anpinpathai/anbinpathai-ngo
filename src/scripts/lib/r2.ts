import { AwsClient } from "aws4fetch";

function config() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    throw new Error("R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET must be set.");
  }
  return {
    client: new AwsClient({
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      service: "s3",
      region: "auto",
    }),
    base: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}`,
  };
}

export type R2Object = { key: string; size: number; lastModified: Date };

export async function putObject(key: string, body: Uint8Array, contentType: string) {
  const { client, base } = config();
  const res = await client.fetch(`${base}/${key}`, {
    method: "PUT",
    body: body as BodyInit,
    headers: { "Content-Type": contentType, "Content-Length": String(body.byteLength) },
  });
  if (!res.ok) throw new Error(`R2 upload of ${key} failed with status ${res.status}`);
}

export async function getObject(key: string) {
  const { client, base } = config();
  const res = await client.fetch(`${base}/${key}`);
  if (!res.ok) throw new Error(`R2 download of ${key} failed with status ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

export async function deleteObject(key: string) {
  const { client, base } = config();
  const res = await client.fetch(`${base}/${key}`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error(`R2 delete of ${key} failed with status ${res.status}`);
}

export async function listObjects(prefix: string): Promise<R2Object[]> {
  const { client, base } = config();
  const found: R2Object[] = [];
  let token: string | undefined;

  do {
    const params = new URLSearchParams({ "list-type": "2", prefix });
    if (token) params.set("continuation-token", token);
    const res = await client.fetch(`${base}?${params.toString()}`);
    if (!res.ok) throw new Error(`R2 list of ${prefix} failed with status ${res.status}`);
    const xml = await res.text();

    for (const block of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const body = block[1];
      const key = /<Key>([^<]*)<\/Key>/.exec(body)?.[1];
      const size = Number(/<Size>(\d+)<\/Size>/.exec(body)?.[1] ?? 0);
      const modified = /<LastModified>([^<]*)<\/LastModified>/.exec(body)?.[1];
      if (key && modified) found.push({ key, size, lastModified: new Date(modified) });
    }

    token = /<IsTruncated>true<\/IsTruncated>/.test(xml)
      ? /<NextContinuationToken>([^<]*)<\/NextContinuationToken>/.exec(xml)?.[1]
      : undefined;
  } while (token);

  return found;
}
