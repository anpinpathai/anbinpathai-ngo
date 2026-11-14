// The small words on the registration form: Tamil for visitors, English for the admin and reviewers.
// Safe to use in the browser.

export type FormUi = {
  required: string;
  optional: string;
  choose: string;
  residenceLk: string;
  residenceAbroad: string;
  otherCountry: string;
  typeCountry: string;
  typeDs: string;
  shareLabel: string;
  shareOn: string;
  privateNote: string;
  photoChoose: string;
  photoChange: string;
  photoRemove: string;
  photoUploading: string;
  photoFailed: string;
  photoNone: string;
  consentRequired: string;
  fixErrors: string;
  failed: string;
  tooMany: string;
};

export const FORM_UI_TA: FormUi = {
  required: "தேவை",
  optional: "விருப்பம்",
  choose: "தெரிவு செய்க",
  residenceLk: "இலங்கை",
  residenceAbroad: "வேறு நாடு",
  otherCountry: "வேறு நாடு",
  typeCountry: "நாட்டின் பெயரை எழுதுங்கள்",
  typeDs: "பிரிவின் பெயரை எழுதுங்கள்",
  shareLabel: "இதைப் பொதுவில் காட்டலாம்",
  shareOn: "பொதுவில் காட்டலாம்",
  privateNote: "நிர்வாகம் மட்டுமே பார்க்கும்",
  photoChoose: "புகைப்படத்தைத் தெரிவு செய்க",
  photoChange: "வேறு புகைப்படம்",
  photoRemove: "நீக்குக",
  photoUploading: "பதிவேற்றுகிறது…",
  photoFailed: "புகைப்படத்தைப் பதிவேற்ற முடியவில்லை. JPG, PNG அல்லது WebP படத்தை முயற்சிக்கவும்.",
  photoNone: "புகைப்படம் இல்லை",
  consentRequired: "பதிவு செய்ய ஒப்புதல் தேவை.",
  fixErrors: "சிவப்பில் காட்டப்பட்ட பிழைகளைத் திருத்தி மீண்டும் அனுப்புங்கள்.",
  failed: "பதிவை அனுப்ப முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.",
  tooMany: "குறுகிய நேரத்தில் பல தடவை அனுப்பப்பட்டது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.",
};

// The words of the stepped registration form that visitors see (Tamil only).
export const WIZARD_UI_TA = {
  previous: "முந்தையது",
  next: "அடுத்தது",
  submit: "பதிவை அனுப்புக",
  sending: "அனுப்புகிறது…",
  progress: "பதிவின் படிகள்",
  step: "படி",
  // The same words the server uses, so a missing answer reads the same on the step and after sending.
  needed: "இந்தக் கேள்விக்குப் பதில் தேவை.",
  country: "நாட்டைத் தெரிவு செய்யுங்கள் அல்லது எழுதுங்கள்.",
  district: "மாவட்டத்தைத் தெரிவு செய்யுங்கள்.",
} as const;

// The same words in English, for the admin's "Add a person" page, which uses the same steps.
export const WIZARD_UI_EN = {
  previous: "Previous",
  next: "Next",
  submit: "Add this person",
  sending: "Adding…",
  progress: "Steps of the form",
  step: "Step",
  needed: "This answer is required.",
  country: "Choose the country or type it.",
  district: "Choose the district.",
} as const;

export const FORM_UI_EN: FormUi = {
  required: "Required",
  optional: "Optional",
  choose: "Choose",
  residenceLk: "Sri Lanka",
  residenceAbroad: "Another country",
  otherCountry: "Another country",
  typeCountry: "Type the country",
  typeDs: "Type the division",
  shareLabel: "Show this publicly",
  shareOn: "Shown publicly",
  privateNote: "Only the admin sees this",
  photoChoose: "Choose a photo",
  photoChange: "Change photo",
  photoRemove: "Remove",
  photoUploading: "Uploading…",
  photoFailed: "The photo could not be uploaded. Try a JPG, PNG or WebP picture.",
  photoNone: "No photo",
  consentRequired: "The consent box must be ticked.",
  fixErrors: "Please fix the highlighted errors and try again.",
  failed: "Could not save. Please try again.",
  tooMany: "Too many tries in a short time. Please wait a while.",
};
