import type { DirectoryStatus } from "@/db/schema";
import type { ReviewState, ReviewVerdict } from "@/lib/directory/reviews";

// What the Reviewers page needs to know about one reviewer, in a form that can be handed to the browser. It never holds
// the link, the password or their fingerprints.
export type ReviewerView = {
  id: number;
  name: string;
  state: ReviewState;
  canSeePrivate: boolean;
  createdText: string;
  expiresText: string;
  // Only the date, for "Keep it (until …)".
  expiresDate: string;
  openedText: string | null;
  // The link and the password can be shown again (false for a reviewer made before they were kept).
  linkKept: boolean;
  waiting: number;
  people: { id: number; name: string; status: DirectoryStatus; verdict: ReviewVerdict | null }[];
};
