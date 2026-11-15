import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getClientIp, isBlocked, recordFailure } from "@/lib/login-throttle";
export { FORM_TOKEN_FIELD, HONEYPOT_FIELD } from "./config";

// The registration form is the one place on the site where strangers can send us something, so it has three cheap
// guards against robots: a hidden question no person can see, a check that the form was open for a few seconds,
// and a limit on how often one visitor can send.


const MIN_SECONDS = 4;
const MAX_HOURS = 6;

export const SUBMIT_LIMIT = 5;
export const UPLOAD_LIMIT = 12;
export const REVIEW_PASSWORD_LIMIT = 6;

function sign(value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be set to a random string of at least 32 characters.");
  return createHmac("sha256", createHmac("sha256", secret).update("directory-form").digest()).update(value).digest("base64url");
}

// Written into the form when the page is made. It says when the form was opened and cannot be forged.
export function makeFormToken(now = Date.now()) {
  const opened = String(now);
  return `${opened}.${sign(opened)}`;
}

export type FormTokenCheck = "ok" | "invalid" | "too_fast" | "expired";

export function checkFormToken(token: string, now = Date.now()): FormTokenCheck {
  const [opened, signature] = token.split(".");
  if (!opened || !signature || !/^\d{10,16}$/.test(opened)) return "invalid";

  const expected = Buffer.from(sign(opened));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return "invalid";

  const seconds = (now - Number(opened)) / 1000;
  if (seconds < MIN_SECONDS) return "too_fast";
  if (seconds > MAX_HOURS * 3600) return "expired";
  return "ok";
}

// "Has this visitor sent too many in the last 15 minutes?" and "count this one".
export async function visitorKey(scope: "submit" | "upload") {
  return `dir-${scope}:${await getClientIp()}`;
}

export function tooMany(key: string, limit: number) {
  return isBlocked(key, limit);
}

export function countOne(key: string) {
  return recordFailure(key);
}
