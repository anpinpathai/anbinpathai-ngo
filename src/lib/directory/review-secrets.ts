import "server-only";
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

// The admin can look at a reviewer's link and password again whenever it is needed, so a copy of each is kept. The copies
// are locked (AES-256-GCM) with a key made from the site's secret, so a copy of the database alone shows nothing.
// If SESSION_SECRET is ever changed the locked copies cannot be opened any more; the admin then makes a new password.
// (The password is still also checked with its own one-way fingerprint, see reviews.ts; this copy is only for showing.)

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be set to a random string of at least 32 characters.");
  return createHmac("sha256", secret).update("directory-review-secrets").digest();
}

// `what` is tied into the lock, so a locked link can never be passed off as a locked password (or the other way round).
export function seal(plain: string, what: "link" | "password") {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  cipher.setAAD(Buffer.from(what));
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), body.toString("base64url")].join(".");
}

// Returns null when there is nothing to open (an older reviewer) or it cannot be opened (the secret key was changed).
export function unseal(sealed: string | null | undefined, what: "link" | "password") {
  if (!sealed) return null;
  const [version, iv, tag, body] = sealed.split(".");
  if (version !== "v1" || !iv || !tag || !body) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
    decipher.setAAD(Buffer.from(what));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(body, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
