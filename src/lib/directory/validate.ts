import "server-only";
import { isValidKey } from "@/lib/storage";
import { FACEBOOK_HOSTS, YOUTUBE_HOSTS, isHttpsUrl, isHttpsUrlOnHosts } from "@/lib/urls";
import {
  MAX_LENGTH,
  RESIDENCE_ABROAD,
  RESIDENCE_LK,
  SRI_LANKA_TA,
  type DirectoryFieldRow,
  type EntryValues,
} from "./config";
import { SRI_LANKA_DISTRICTS, dsDivisionsOf } from "./places";

// Who is filling in the form. On the public form the questions marked "required" must be answered; the admin and
// a reviewer may save an incomplete entry (only the name is always needed).
export type EntryMode = "public" | "admin" | "reviewer";

export type EntryErrors = Record<string, string>;

export type RawEntryForm = { values: EntryValues; shares: Record<string, boolean> };

export type CleanEntry = { values: EntryValues; shares: Record<string, boolean>; errors: EntryErrors };

export type Messages = {
  required: string;
  tooLong: (n: number) => string;
  tooShort: (n: number) => string;
  email: string;
  phone: string;
  url: string;
  facebook: string;
  youtube: string;
  links: (n: number) => string;
  number: string;
  choice: string;
  residence: string;
  country: string;
  sriLankaCountry: string;
  district: string;
  postal: string;
  photo: string;
};

export const MESSAGES_TA: Messages = {
  required: "இந்தக் கேள்விக்குப் பதில் தேவை.",
  tooLong: (n) => `அதிகபட்சம் ${n} எழுத்துகள் மட்டுமே.`,
  tooShort: (n) => `குறைந்தது ${n} எழுத்துகள் தேவை.`,
  email: "சரியான மின்னஞ்சல் முகவரியை எழுதுங்கள்.",
  phone: "சரியான தொலைபேசி இலக்கத்தை எழுதுங்கள்.",
  url: "இணைப்பு https:// என்று தொடங்க வேண்டும்.",
  facebook: "இது Facebook இணைப்பாக இருக்க வேண்டும் (https://www.facebook.com/…).",
  youtube: "இது YouTube இணைப்பாக இருக்க வேண்டும் (https://www.youtube.com/…).",
  links: (n) => `ஒவ்வொரு வரியிலும் https:// என்று தொடங்கும் ஒரு இணைப்பு மட்டும்; அதிகபட்சம் ${n} இணைப்புகள்.`,
  number: "சரியான எண்ணை எழுதுங்கள்.",
  choice: "பட்டியலில் உள்ள ஒன்றைத் தெரிவு செய்யுங்கள்.",
  residence: "நீங்கள் வசிப்பது இலங்கையிலா அல்லது வேறு நாட்டிலா என்பதைத் தெரிவு செய்யுங்கள்.",
  country: "நாட்டைத் தெரிவு செய்யுங்கள் அல்லது எழுதுங்கள்.",
  sriLankaCountry: "இலங்கையில் வசித்தால் மேலே “இலங்கை” என்பதைத் தெரிவு செய்யுங்கள்.",
  district: "மாவட்டத்தைத் தெரிவு செய்யுங்கள்.",
  postal: "தபால் குறியீடு ஐந்து இலக்கங்களாக இருக்க வேண்டும்.",
  photo: "புகைப்படத்தைச் சேர்ப்பதில் சிக்கல். மீண்டும் முயற்சிக்கவும்.",
};

export const MESSAGES_EN: Messages = {
  required: "This answer is required.",
  tooLong: (n) => `Maximum ${n} characters allowed.`,
  tooShort: (n) => `At least ${n} characters are needed.`,
  email: "Enter a valid email address.",
  phone: "Enter a valid phone number.",
  url: "The link must start with https://",
  facebook: "This must be a Facebook link (https://www.facebook.com/…).",
  youtube: "This must be a YouTube link (https://www.youtube.com/…).",
  links: (n) => `One link per line, each starting with https:// (at most ${n} links).`,
  number: "Enter a valid number.",
  choice: "Pick one of the choices in the list.",
  residence: "Choose whether they live in Sri Lanka or in another country.",
  country: "Choose or write the country.",
  sriLankaCountry: "For Sri Lanka, choose “Sri Lanka” at the top instead.",
  district: "Choose the district.",
  postal: "The postal code must be five digits.",
  photo: "There is a problem with the photo. Please try again.",
};

// Control characters and the "text direction" tricks that can make a name look like something else.
const UNSAFE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F‪-‮⁦-⁩]/g;

export function oneLine(value: string) {
  return value.replace(UNSAFE, "").replace(/\s+/g, " ").trim();
}

export function manyLines(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(UNSAFE, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const LOCATION_KEYS = new Set(["residence", "country", "district", "ds_division", "gn_division", "postal_code", "city", "native_district"]);

// Reads the answers out of a submitted form. Only the questions in `fields` are read; anything else is ignored.
export function readEntryForm(formData: FormData, fields: readonly DirectoryFieldRow[]): RawEntryForm {
  const values: EntryValues = {};
  const shares: Record<string, boolean> = {};

  for (const field of fields) {
    values[field.key] =
      field.type === "multiselect"
        ? formData.getAll(field.key).map(String)
        : String(formData.get(field.key) ?? "");
    if (field.visibility === "applicant") shares[field.key] = formData.get(`share:${field.key}`) === "1";
  }
  return { values, shares };
}

function maxLengthFor(field: DirectoryFieldRow) {
  if (field.key === "name") return MAX_LENGTH.name;
  if (field.key === "bio") return MAX_LENGTH.bio;
  if (field.type === "textarea") return MAX_LENGTH.textarea;
  if (field.type === "url") return MAX_LENGTH.url;
  if (field.type === "email") return MAX_LENGTH.email;
  if (field.type === "tel") return MAX_LENGTH.tel;
  return MAX_LENGTH.text;
}

function single(raw: string | string[] | undefined) {
  return Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
}

function validateNumber(key: string, text: string, msg: Messages) {
  if (!/^\d{1,9}$/.test(text)) return msg.number;
  const n = Number(text);
  if (key === "start_year" && (n < 1800 || n > new Date().getFullYear())) return msg.number;
  if (key === "books_count" && n > 100000) return msg.number;
  return null;
}

export function validateEntry(
  raw: RawEntryForm,
  fields: readonly DirectoryFieldRow[],
  mode: EntryMode,
  msg: Messages = mode === "public" ? MESSAGES_TA : MESSAGES_EN,
): CleanEntry {
  const values: EntryValues = {};
  const errors: EntryErrors = {};
  const shares: Record<string, boolean> = {};

  const byKey = new Map(fields.map((f) => [f.key, f]));
  const mustAnswer = (field: DirectoryFieldRow) => (mode === "public" ? field.required : field.key === "name");

  // 1. Every question that is not about the place.
  for (const field of fields) {
    if (LOCATION_KEYS.has(field.key)) continue;
    const required = mustAnswer(field);
    const max = maxLengthFor(field);

    if (field.type === "multiselect") {
      const picked = [...new Set((Array.isArray(raw.values[field.key]) ? (raw.values[field.key] as string[]) : []).map(oneLine))].filter(Boolean);
      if (picked.length > 30 || picked.some((p) => !field.options.includes(p))) errors[field.key] = msg.choice;
      else if (required && picked.length === 0) errors[field.key] = msg.required;
      values[field.key] = picked;
      continue;
    }

    const text = field.type === "textarea" || field.type === "links" ? manyLines(single(raw.values[field.key])) : oneLine(single(raw.values[field.key]));
    values[field.key] = text;

    if (!text) {
      if (required) errors[field.key] = msg.required;
      continue;
    }
    if (text.length > max * (field.type === "links" ? 4 : 1)) {
      errors[field.key] = msg.tooLong(max);
      continue;
    }

    switch (field.type) {
      case "text":
        if (field.key === "name" && [...text].length < 2) errors[field.key] = msg.tooShort(2);
        break;
      case "number": {
        const problem = validateNumber(field.key, text, msg);
        if (problem) errors[field.key] = problem;
        break;
      }
      case "select":
        if (field.options.length > 0 && !field.options.includes(text)) errors[field.key] = msg.choice;
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) errors[field.key] = msg.email;
        else values[field.key] = text.toLowerCase();
        break;
      case "tel":
        if (!/^[0-9+()\-\s]{6,30}$/.test(text)) errors[field.key] = msg.phone;
        break;
      case "url":
        if (field.key === "facebook") {
          if (!isHttpsUrlOnHosts(text, FACEBOOK_HOSTS)) errors[field.key] = msg.facebook;
        } else if (field.key === "youtube") {
          if (!isHttpsUrlOnHosts(text, YOUTUBE_HOSTS)) errors[field.key] = msg.youtube;
        } else if (!isHttpsUrl(text)) errors[field.key] = msg.url;
        break;
      case "links": {
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length > MAX_LENGTH.links || lines.some((l) => l.length > MAX_LENGTH.url || !isHttpsUrl(l))) {
          errors[field.key] = msg.links(MAX_LENGTH.links);
        } else values[field.key] = lines.join("\n");
        break;
      }
      case "photo":
        if (!isValidKey(text)) errors[field.key] = msg.photo;
        break;
      default:
        break;
    }
  }

  // 2. The place: lives in Sri Lanka, or in another country.
  const residenceField = byKey.get("residence");
  if (residenceField) {
    const residence = oneLine(single(raw.values.residence));
    values.residence = residence;

    if (residence !== RESIDENCE_LK && residence !== RESIDENCE_ABROAD) {
      errors.residence = msg.residence;
    } else {
      validatePlace(residence, raw, byKey, mustAnswer, msg, values, errors);
    }
  }

  // 3. What the person agreed to show publicly (only for questions where the person chooses).
  for (const field of fields) {
    if (field.visibility === "applicant") shares[field.key] = raw.shares[field.key] === true;
  }

  return { values, shares, errors };
}

function validatePlace(
  residence: string,
  raw: RawEntryForm,
  byKey: Map<string, DirectoryFieldRow>,
  mustAnswer: (field: DirectoryFieldRow) => boolean,
  msg: Messages,
  values: EntryValues,
  errors: EntryErrors,
) {
  const text = (key: string, max: number) => {
    const value = oneLine(single(raw.values[key]));
    if (value.length > max) errors[key] = msg.tooLong(max);
    return value;
  };
  const has = (key: string) => byKey.has(key);
  const need = (key: string) => {
    const field = byKey.get(key);
    return Boolean(field && mustAnswer(field));
  };

  const lk = residence === RESIDENCE_LK;

  if (has("country")) {
    if (lk) values.country = SRI_LANKA_TA;
    else {
      const country = text("country", 60);
      values.country = country;
      // Someone who lives abroad always needs a country, even when the admin fills the form in.
      if (!country) errors.country = msg.country;
      else if (country === SRI_LANKA_TA) errors.country = msg.sriLankaCountry;
    }
  }

  if (has("district")) {
    if (!lk) values.district = "";
    else {
      const district = oneLine(single(raw.values.district));
      values.district = district;
      if (!district) {
        if (need("district")) errors.district = msg.district;
      } else if (!(SRI_LANKA_DISTRICTS as readonly string[]).includes(district)) errors.district = msg.choice;
    }
  }

  if (has("ds_division")) {
    if (!lk) values.ds_division = "";
    else {
      const ds = text("ds_division", 80);
      values.ds_division = ds;
      const list = dsDivisionsOf(String(values.district ?? ""));
      if (!ds) {
        if (need("ds_division")) errors.ds_division = msg.required;
      } else if (list && !list.includes(ds)) errors.ds_division = msg.choice;
    }
  }

  if (has("gn_division")) {
    if (!lk) values.gn_division = "";
    else {
      const gn = text("gn_division", 80);
      values.gn_division = gn;
      if (!gn && need("gn_division")) errors.gn_division = msg.required;
    }
  }

  if (has("postal_code")) {
    if (!lk) values.postal_code = "";
    else {
      const postal = oneLine(single(raw.values.postal_code)).replace(/\s/g, "");
      values.postal_code = postal;
      if (!postal) {
        if (need("postal_code")) errors.postal_code = msg.required;
      } else if (!/^\d{5}$/.test(postal)) errors.postal_code = msg.postal;
    }
  }

  if (has("city")) {
    const city = text("city", 80);
    values.city = city;
    if (!city && need("city")) errors.city = msg.required;
  }

  if (has("native_district")) {
    if (lk) values.native_district = "";
    else {
      const native = oneLine(single(raw.values.native_district));
      values.native_district = native;
      if (!native) {
        if (need("native_district")) errors.native_district = msg.required;
      } else if (!(SRI_LANKA_DISTRICTS as readonly string[]).includes(native)) errors.native_district = msg.choice;
    }
  }
}
