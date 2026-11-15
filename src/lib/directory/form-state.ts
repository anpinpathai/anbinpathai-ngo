import type { EntryValues } from "./config";

// What a form action sends back: the answers (so nothing the person typed is lost), the errors, and a message.
export type EntryFormState = {
  status: "idle" | "error" | "saved" | "submitted";
  message?: string;
  values: EntryValues;
  shares: Record<string, boolean>;
  errors: Record<string, string>;
};

export type EntryFormAction = (prev: EntryFormState, formData: FormData) => Promise<EntryFormState>;
