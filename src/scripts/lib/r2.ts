import { AwsClient } from "aws4fetch";

export type R2Object = { key: string; size: number; lastModified: Date };

// Two places can be used:
//   "photos"  - the website's bucket (R2_BUCKET). It has a public address, so everything in it can be opened by anyone.
//   "backups" - a separate PRIVATE bucket (R2_BACKUP_BUCKET) with no public address. Database copies go only here,
//               because they hold the admin login hash, drafts and settings.
type Target = "photos" | "backups";

function config(target: Target) {
  const env = process.env;

  if (target === "photos") {
    const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = env;
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

  const { R2_ACCOUNT_ID, R2_BUCKET, R2_BACKUP_BUCKET } = env;
  if (!R2_ACCOUNT_ID || !R2_BACKUP_BUCKET) {
    throw new Error(
      "R2_BACKUP_BUCKET must be set to the name of a PRIVATE R2 bucket (one with no public address). " +
        "Backups are never written to the public photo bucket.",
    );
  }
  if (R2_BACKUP_BUCKET === R2_BUCKET) {
    throw new Error(
      "R2_BACKUP_BUCKET is the same bucket as R2_BUCKET, which is public. Create a separate private bucket for backups.",
    );
  }

  // A key made only for the backup bucket is best. If there is none, the website's key is used (it then must be
  // allowed to read and write both buckets).
  const accessKeyId = env.R2_BACKUP_ACCESS_KEY_ID || env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_BACKUP_SECRET_ACCESS_KEY || env.R2_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("Set R2_BACKUP_ACCESS_KEY_ID and R2_BACKUP_SECRET_ACCESS_KEY (or the R2_ACCESS_KEY_ID pair).");
  }

  return {
    client: new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" }),
    base: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BACKUP_BUCKET}`,
  };
}

function store(target: Target) {
  return {
    async putObject(key: string, body: Uint8Array, contentType: string) {
      const { client, base } = config(target);
      const res = await client.fetch(`${base}/${key}`, {
        method: "PUT",
        body: body as BodyInit,
        headers: { "Content-Type": contentType, "Content-Length": String(body.byteLength) },
      });
      if (!res.ok) throw new Error(`R2 upload of ${key} failed with status ${res.status}`);
    },

    async getObject(key: string) {
      const { client, base } = config(target);
      const res = await client.fetch(`${base}/${key}`);
      if (!res.ok) throw new Error(`R2 download of ${key} failed with status ${res.status}`);
      return new Uint8Array(await res.arrayBuffer());
    },

    async deleteObject(key: string) {
      const { client, base } = config(target);
      const res = await client.fetch(`${base}/${key}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) throw new Error(`R2 delete of ${key} failed with status ${res.status}`);
    },

    async listObjects(prefix: string): Promise<R2Object[]> {
      const { client, base } = config(target);
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
    },
  };
}

// The website's photo bucket (used by `cleanup:photos`).
export const { putObject, getObject, deleteObject, listObjects } = store("photos");

// The private backup bucket (used by `backup` and `restore`).
export const backupStore = store("backups");
