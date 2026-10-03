export type SettingFieldType = "text" | "textarea" | "email" | "tel" | "facebook" | "youtube" | "image";

export type SettingField = {
  key: string;
  label: string;
  help?: string;
  type: SettingFieldType;
  maxLength: number;
  lang?: string;
};

export type SettingGroup = { title: string; fields: readonly SettingField[] };

export const settingGroups: readonly SettingGroup[] = [
  {
    title: "Home page",
    fields: [
      {
        key: "home_banner",
        label: "Home page banner image",
        help: "Choose one large image. It is resized automatically.",
        type: "image",
        maxLength: 200,
      },
      {
        key: "site_tagline",
        label: "Tagline",
        help: "Short motto shown on the website. Write it in Tamil.",
        type: "text",
        maxLength: 120,
        lang: "ta",
      },
      {
        key: "home_headline",
        label: "Home page headline",
        help: "Write it in Tamil.",
        type: "text",
        maxLength: 160,
        lang: "ta",
      },
      {
        key: "home_welcome",
        label: "Welcome text",
        help: "Write it in Tamil.",
        type: "textarea",
        maxLength: 600,
        lang: "ta",
      },
    ],
  },
  {
    title: "Bank details (for donations)",
    fields: [
      { key: "bank_name", label: "Bank name", type: "text", maxLength: 100 },
      { key: "bank_branch", label: "Branch", type: "text", maxLength: 100 },
      { key: "bank_account_name", label: "Account name", type: "text", maxLength: 120 },
      { key: "bank_account_number", label: "Account number", type: "text", maxLength: 40 },
      {
        key: "bank_note",
        label: "Additional note",
        help: "Shown on the Donation page.",
        type: "textarea",
        maxLength: 500,
      },
    ],
  },
  {
    title: "Contact details",
    fields: [
      { key: "contact_phone", label: "Phone number", type: "tel", maxLength: 40 },
      { key: "contact_email", label: "Email address", type: "email", maxLength: 120 },
      { key: "contact_address", label: "Address", type: "textarea", maxLength: 300 },
    ],
  },
  {
    title: "Social media",
    fields: [
      {
        key: "facebook_url",
        label: "Facebook page link",
        help: "Example: https://www.facebook.com/yourpage",
        type: "facebook",
        maxLength: 200,
      },
      {
        key: "youtube_url",
        label: "YouTube channel link",
        help: "Example: https://www.youtube.com/@yourchannel",
        type: "youtube",
        maxLength: 200,
      },
    ],
  },
];

export const admin = {
  title: "Admin Panel",
  login: {
    title: "Admin Login",
    username: "Username",
    password: "Password",
    submit: "Log in",
    pending: "Logging in…",
    invalid: "Incorrect username or password.",
    blocked: "Too many failed attempts. Please wait a while and try again.",
    required: "Please enter your username and password.",
    failed: "Could not log in. Please try again.",
    backToSite: "Back to the website",
  },
  nav: {
    dashboard: "Dashboard",
    settings: "Settings",
    viewSite: "View website",
    logout: "Log out",
  },
  dashboard: {
    title: "Welcome",
    intro: "Manage the website content from here.",
    soon: "Coming soon",
    cards: {
      settings: {
        title: "Settings",
        text: "Bank details, contact details, social media links and the home page texts.",
      },
      posts: {
        title: "Posts",
        text: "Add news and updates for the four categories.",
      },
      team: {
        title: "Executive Committee",
        text: "Manage committee members' details and photos.",
      },
    },
  },
  settings: {
    title: "Settings",
    save: "Save changes",
    saving: "Saving…",
    saved: "Changes saved.",
    fixErrors: "Please fix the highlighted errors and try again.",
    saveFailed: "Could not save. Please try again.",
    tooLong: (n: number) => `Maximum ${n} characters allowed.`,
    errors: {
      email: "Enter a valid email address.",
      phone: "Enter a valid phone number.",
      facebook: "Enter a valid Facebook link (https://facebook.com/…).",
      youtube: "Enter a valid YouTube link (https://youtube.com/…).",
      image: "Please upload the image again.",
    },
  },
  uploader: {
    choose: "Choose image",
    change: "Change image",
    remove: "Remove image",
    uploading: "Uploading…",
    noImage: "No image selected.",
    unsupported: "This image format is not supported. Use a JPG, PNG or WebP image.",
    failed: "Could not upload the image. Please try again.",
    notConfigured: "Photo storage is not set up yet.",
  },
} as const;
