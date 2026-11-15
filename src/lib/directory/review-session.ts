import "server-only";
import { createHmac } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { findReviewByToken, passwordMark, reviewState, type ReviewRow } from "./reviews";

// After a reviewer types the right password, a small cookie remembers it for a few hours. It works only for
// that one review link, is signed with its own key (so it can never be used as an admin login), and is only
// sent to the /directory/review pages. It also carries a fingerprint of the password, so when the admin sets a new
// password the old cookies stop working at once.

const COOKIE = "dir_review";
const MAX_AGE_SECONDS = 4 * 60 * 60;
const PATH = "/directory/review";

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be set to a random string of at least 32 characters.");
  return new Uint8Array(createHmac("sha256", secret).update("directory-review").digest());
}

export async function startReviewSession(review: Pick<ReviewRow, "id" | "tokenHash" | "passwordHash">) {
  const token = await new SignJWT({ rid: review.id, th: review.tokenHash.slice(0, 16), ph: passwordMark(review), typ: "dir-review" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(key());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: PATH,
  });
}

async function readSession(): Promise<{ rid: number; th: string; ph: string } | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    if (payload.typ !== "dir-review" || typeof payload.rid !== "number" || typeof payload.th !== "string" || typeof payload.ph !== "string") {
      return null;
    }
    return { rid: payload.rid, th: payload.th, ph: payload.ph };
  } catch {
    return null;
  }
}

export type ReviewAccess =
  | { status: "invalid" }
  | { status: "closed"; why: "expired" | "revoked" }
  | { status: "locked"; review: ReviewRow }
  | { status: "open"; review: ReviewRow };

// Looks at the secret link and the cookie together. "locked" means the link is fine but the password is needed.
export async function reviewAccess(token: string): Promise<ReviewAccess> {
  const review = await findReviewByToken(token);
  if (!review) return { status: "invalid" };

  const state = reviewState(review);
  if (state !== "ok") return { status: "closed", why: state };

  const session = await readSession();
  if (!session || session.rid !== review.id || session.th !== review.tokenHash.slice(0, 16) || session.ph !== passwordMark(review)) {
    return { status: "locked", review };
  }
  return { status: "open", review };
}
