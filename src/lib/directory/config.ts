// Shared settings of the registry ("படைப்பாளிகள் பதிவகம்"). Safe to use in the browser as well as on the server.
// The wording of the questions is in Sri Lankan Tamil. Please have it checked by the client (docs/glossary-ta-LK.md).

import type { DirectoryFieldType, DirectoryStatus, DirectoryVisibility } from "@/db/schema";

export type DirectoryFieldRow = {
  id: number;
  key: string;
  label: string;
  help: string;
  type: DirectoryFieldType;
  options: string[];
  section: string;
  required: boolean;
  onForm: boolean;
  visibility: DirectoryVisibility;
  filterable: boolean;
  builtin: boolean;
  sortOrder: number;
};

// A person's answers, by field key. A single choice or text is a string, many choices are a list.
export type EntryValues = Record<string, string | string[]>;

// The groups the questions are shown in, in this order.
export const SECTIONS = [
  { key: "basic", ta: "அடிப்படை விபரங்கள்", en: "Basic details" },
  { key: "location", ta: "வசிக்கும் இடம்", en: "Where they live" },
  { key: "art", ta: "கலை இலக்கியத் துறை", en: "Arts and literature field" },
  { key: "journey", ta: "கலை இலக்கியப் பயணம்", en: "Their journey" },
  { key: "about", ta: "சுய அறிமுகம்", en: "About them" },
  { key: "works", ta: "படைப்புகள்", en: "Their works" },
  { key: "contact", ta: "தொடர்பு விபரங்கள்", en: "Contact" },
  { key: "other", ta: "மேலும் விபரங்கள்", en: "More details" },
] as const;

export function sectionIndex(key: string) {
  const index = SECTIONS.findIndex((s) => s.key === key);
  return index === -1 ? SECTIONS.length - 1 : index;
}

// Fields that are stored in their own column of the entry (the list and the filters use them).
export const COLUMN_FIELDS = {
  name: "name",
  photo: "photoKey",
  art_fields: "artFields",
  residence: "residence",
  country: "country",
  district: "district",
  ds_division: "dsDivision",
  gn_division: "gnDivision",
  postal_code: "postalCode",
  city: "city",
  native_district: "nativeDistrict",
} as const;
export type ColumnFieldKey = keyof typeof COLUMN_FIELDS;

export const LOCATION_KEYS = [
  "residence",
  "country",
  "district",
  "ds_division",
  "gn_division",
  "postal_code",
  "city",
  "native_district",
] as const;

// These can never be switched off or made private: without them there is nothing to list.
export const ALWAYS_ON_KEYS = ["name", "residence"] as const;
export const ALWAYS_PUBLIC_KEYS = ["name", "residence"] as const;

export const RESIDENCE_LK = "lk";
export const RESIDENCE_ABROAD = "abroad";
export const SRI_LANKA_TA = "இலங்கை";

export const STATUS_LABEL_EN: Record<DirectoryStatus, string> = {
  pending: "Waiting for review",
  approved: "Approved",
  update_needed: "Needs an update",
  rejected: "Rejected",
  withdrawn: "Hidden",
};

export const VISIBILITY_LABEL_EN: Record<DirectoryVisibility, string> = {
  public: "Public",
  private: "Only you (admin)",
  applicant: "The person chooses",
};

export const TYPE_LABEL_EN: Record<DirectoryFieldType, string> = {
  text: "Short answer",
  textarea: "Long answer",
  number: "Number",
  date: "Date",
  select: "Pick one from a list",
  multiselect: "Pick many from a list",
  url: "Web link",
  links: "Several web links",
  email: "Email address",
  tel: "Phone number",
  photo: "Photo",
};

export const MAX_LENGTH = { text: 200, name: 120, textarea: 3000, bio: 4000, url: 300, email: 120, tel: 30, links: 10 } as const;

const ART_FIELDS = [
  "கவிஞர்",
  "சிறுகதை எழுத்தாளர்",
  "நாவலாசிரியர்",
  "கட்டுரையாளர்",
  "நாடகக் கலைஞர்",
  "பாடலாசிரியர்",
  "இசைக் கலைஞர்",
  "பாடகர்",
  "ஓவியர்",
  "சிற்பி",
  "நாட்டுப்புறக் கலைஞர்",
  "கூத்துக் கலைஞர்",
  "வில்லுப்பாட்டுக் கலைஞர்",
  "ஆய்வாளர்",
  "இலக்கிய விமர்சகர்",
  "மொழிபெயர்ப்பாளர்",
  "ஊடகவியலாளர்",
  "நூல் வெளியீட்டாளர்",
  "ஆவணப்படக் கலைஞர்",
  "புகைப்படக் கலைஞர்",
  "கலை இலக்கிய அமைப்பாளர்",
  "கலை இலக்கிய ஆர்வலர்",
  "ஏனையவை",
];

type DefaultField = Omit<DirectoryFieldRow, "id" | "sortOrder" | "builtin">;

// The questions the registry starts with. After the first start the admin changes them in the admin panel.
export const DEFAULT_FIELDS: readonly DefaultField[] = [
  // Basic
  { key: "name", label: "முழுப்பெயர்", help: "உங்கள் முழுப்பெயரைத் தமிழில் எழுதுங்கள்.", type: "text", options: [], section: "basic", required: true, onForm: true, visibility: "public", filterable: false },
  { key: "pen_name", label: "புனைபெயர்", help: "புனைபெயர் இருந்தால் மட்டும் எழுதுங்கள்.", type: "text", options: [], section: "basic", required: false, onForm: true, visibility: "public", filterable: false },
  { key: "photo", label: "புகைப்படம்", help: "உங்கள் தெளிவான புகைப்படம் ஒன்றைச் சேர்க்கலாம்.", type: "photo", options: [], section: "basic", required: false, onForm: true, visibility: "public", filterable: false },
  { key: "occupation", label: "தற்போதைய தொழில்", help: "", type: "text", options: [], section: "basic", required: false, onForm: true, visibility: "applicant", filterable: false },
  // Private (only the admin sees it) and optional. A date box with a calendar; it must be a real date and not in the future.
  { key: "date_of_birth", label: "பிறந்த திகதி", help: "", type: "date", options: [], section: "basic", required: false, onForm: true, visibility: "private", filterable: false },
  // Where they live
  { key: "residence", label: "தற்போது நீங்கள் வசிப்பது", help: "", type: "select", options: [], section: "location", required: true, onForm: true, visibility: "public", filterable: true },
  { key: "country", label: "நாடு", help: "", type: "text", options: [], section: "location", required: true, onForm: true, visibility: "public", filterable: true },
  { key: "district", label: "மாவட்டம்", help: "", type: "text", options: [], section: "location", required: true, onForm: true, visibility: "public", filterable: true },
  { key: "ds_division", label: "பிரதேச செயலாளர் பிரிவு", help: "", type: "text", options: [], section: "location", required: false, onForm: true, visibility: "public", filterable: true },
  { key: "gn_division", label: "கிராம அலுவலர் பிரிவு", help: "", type: "text", options: [], section: "location", required: false, onForm: true, visibility: "private", filterable: false },
  { key: "postal_code", label: "தபால் குறியீட்டு இலக்கம்", help: "ஐந்து இலக்கங்கள்.", type: "text", options: [], section: "location", required: false, onForm: true, visibility: "private", filterable: false },
  { key: "city", label: "நகரம் / ஊர்", help: "", type: "text", options: [], section: "location", required: false, onForm: true, visibility: "public", filterable: false },
  { key: "native_district", label: "இலங்கையில் பூர்வீக மாவட்டம்", help: "", type: "text", options: [], section: "location", required: false, onForm: true, visibility: "public", filterable: true },
  // Field
  { key: "art_fields", label: "கலை இலக்கியத் துறைகள்", help: "பொருந்தும் அனைத்தையும் தெரிவு செய்யலாம்.", type: "multiselect", options: ART_FIELDS, section: "art", required: true, onForm: true, visibility: "public", filterable: true },
  // Journey
  { key: "start_year", label: "கலைப்பணியை ஆரம்பித்த ஆண்டு", help: "", type: "number", options: [], section: "journey", required: false, onForm: true, visibility: "public", filterable: false },
  { key: "books_count", label: "வெளியிட்ட நூல்களின் எண்ணிக்கை", help: "", type: "number", options: [], section: "journey", required: false, onForm: true, visibility: "public", filterable: false },
  { key: "books", label: "நூல்களின் பெயர்கள்", help: "ஒவ்வொரு நூலையும் புதிய வரியில் எழுதுங்கள்.", type: "textarea", options: [], section: "journey", required: false, onForm: true, visibility: "public", filterable: false },
  { key: "awards", label: "பெற்ற விருதுகள்", help: "", type: "textarea", options: [], section: "journey", required: false, onForm: true, visibility: "public", filterable: false },
  { key: "organizations", label: "அங்கம் வகிக்கும் அமைப்புகள்", help: "", type: "textarea", options: [], section: "journey", required: false, onForm: true, visibility: "public", filterable: false },
  { key: "achievements", label: "முக்கிய சாதனைகள்", help: "", type: "textarea", options: [], section: "journey", required: false, onForm: true, visibility: "public", filterable: false },
  // About
  { key: "bio", label: "சுய அறிமுகம்", help: "உங்களைப் பற்றி 100 முதல் 300 சொற்களில் எழுதுங்கள்.", type: "textarea", options: [], section: "about", required: true, onForm: true, visibility: "public", filterable: false },
  // Works
  { key: "work_links", label: "படைப்புகளின் இணைப்புகள்", help: "ஒவ்வொரு இணைப்பையும் புதிய வரியில் எழுதுங்கள். இணைப்பு https:// என்று தொடங்க வேண்டும்.", type: "links", options: [], section: "works", required: false, onForm: true, visibility: "public", filterable: false },
  { key: "video_links", label: "காணொளி / ஒலி இணைப்புகள்", help: "YouTube போன்ற இணைப்புகள். ஒவ்வொன்றையும் புதிய வரியில் எழுதுங்கள்.", type: "links", options: [], section: "works", required: false, onForm: true, visibility: "public", filterable: false },
  { key: "website", label: "இணையத்தளம்", help: "https:// என்று தொடங்க வேண்டும்.", type: "url", options: [], section: "works", required: false, onForm: true, visibility: "public", filterable: false },
  // Contact. Email, phone and WhatsApp stay private.
  { key: "email", label: "மின்னஞ்சல்", help: "", type: "email", options: [], section: "contact", required: true, onForm: true, visibility: "private", filterable: false },
  { key: "phone", label: "தொலைபேசி", help: "", type: "tel", options: [], section: "contact", required: false, onForm: true, visibility: "private", filterable: false },
  { key: "whatsapp", label: "WhatsApp", help: "", type: "tel", options: [], section: "contact", required: false, onForm: true, visibility: "private", filterable: false },
  { key: "facebook", label: "Facebook இணைப்பு", help: "", type: "url", options: [], section: "contact", required: false, onForm: true, visibility: "applicant", filterable: false },
  { key: "youtube", label: "YouTube இணைப்பு", help: "", type: "url", options: [], section: "contact", required: false, onForm: true, visibility: "applicant", filterable: false },
  { key: "other_social", label: "பிற சமூக வலைத்தளங்கள்", help: "", type: "links", options: [], section: "contact", required: false, onForm: true, visibility: "applicant", filterable: false },
];

// Hidden form parts that only robots touch (see spam.ts).
export const HONEYPOT_FIELD = "contact_by_fax";
export const FORM_TOKEN_FIELD = "form_opened";

export const AP_CODE_PREFIX = "AP-ART-";

export function formatCode(n: number) {
  return `${AP_CODE_PREFIX}${String(n).padStart(5, "0")}`;
}

export function isValidCode(value: string) {
  return /^AP-ART-\d{5,}$/.test(value);
}

export function emptyIfAbsent(value: string | string[] | undefined) {
  return value === undefined ? "" : value;
}
