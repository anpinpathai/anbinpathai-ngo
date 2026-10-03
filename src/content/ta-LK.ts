export type ColorKey = "red" | "green" | "purple" | "blue";

export type CategoryDef = {
  slug: string;
  name: string;
  colorKey: ColorKey;
  href: string;
};

export const categories: readonly CategoryDef[] = [
  { slug: "social", name: "அன்பின்பாதை – சமூகப் பணிகள்", colorKey: "red", href: "/activities/social" },
  { slug: "green", name: "பசுமைத் தாயகம்", colorKey: "green", href: "/activities/green" },
  { slug: "arts", name: "கலை & இலக்கியம்", colorKey: "purple", href: "/activities/arts" },
  { slug: "reading", name: "வாசிப்போம் சுவாசிப்போம்", colorKey: "blue", href: "/reading" },
];

export type NavChild = { label: string; href: string; colorKey?: ColorKey };
export type NavItem = { label: string; href?: string; children?: readonly NavChild[] };

export const nav: readonly NavItem[] = [
  { label: "முகப்பு", href: "/" },
  {
    label: "எங்களைப் பற்றி",
    children: [
      { label: "எமது பயணம்", href: "/about" },
      { label: "நிர்வாகசபை", href: "/team" },
    ],
  },
  {
    label: "செயற்பாடுகள்",
    children: categories
      .filter((c) => c.slug !== "reading")
      .map((c) => ({ label: c.name, href: c.href, colorKey: c.colorKey })),
  },
  { label: "வாசிப்போம் சுவாசிப்போம்", href: "/reading" },
  { label: "தொடர்பு", href: "/contact" },
];

export const donate = { label: "நன்கொடை", href: "/donate" };

export const t = {
  siteName: "அன்பின்பாதை எண்ணம்போல் வாழ்க்கை கலை இலக்கிய மன்றம் – திருகோணமலை",
  siteShortName: "அன்பின்பாதை",
  siteSubName: "எண்ணம்போல் வாழ்க்கை கலை இலக்கிய மன்றம் – திருகோணமலை",
  tagline: "மண்ணும் மனிதமும் காப்போம்",
  a11y: {
    skipToContent: "முதன்மை உள்ளடக்கத்திற்குச் செல்லவும்",
    mainNav: "முதன்மைப் பட்டியல்",
    openMenu: "பட்டியலைத் திறக்க",
    closeMenu: "பட்டியலை மூட",
  },
  footer: {
    aboutTitle: "எங்களைப் பற்றி",
    aboutText:
      "அன்பின்பாதை எண்ணம்போல் வாழ்க்கை கலை இலக்கிய மன்றம் – திருகோணமலை சமூக, கலை, இலக்கிய மற்றும் கல்வி சார்ந்த செயற்பாடுகளை முன்னெடுத்து வரும் அமைப்பாகும்.",
    since: "2017 முதல் தொடரும் எமது பணிகள்",
    linksTitle: "முக்கிய இணைப்புகள்",
    rights: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
    contactTitle: "தொடர்புகளுக்கு",
    followTitle: "எங்களைப் பின்தொடருங்கள்",
    facebook: "பேஸ்புக்",
    youtube: "யூடியூப்",
  },
  home: {
    headline: "எண்ணங்கள் உயர்ந்தால்… வாழ்க்கையும் உயர்கிறது.",
    welcome:
      "கல்வி, கலை இலக்கியம், சமூக சேவை மற்றும் மனிதநேயப் பணிகளின் ஊடாக சமூகத்தில் சிறந்த மாற்றத்தை உருவாக்கும் பயணத்தில் எங்களுடன் இணைந்திடுங்கள்.",
    buttons: {
      about: { label: "எங்களைப் பற்றி", href: "/about" },
      activities: { label: "எமது செயற்பாடுகள்", href: "/activities/social" },
      join: { label: "உறுப்பினராகுங்கள்", href: "/contact" },
    },
    sample: {
      title: "வடிவமைப்பு மாதிரி",
      categoriesTitle: "எமது நான்கு பிரிவுகள்",
      postTitle: "புதிய பதிவின் தலைப்பு இங்கே இடம்பெறும்",
      postExcerpt: "பதிவின் சுருக்கம் இங்கே இடம்பெறும். இது வடிவமைப்பைச் சோதிப்பதற்கான மாதிரி எழுத்து மட்டுமே.",
      readMore: "மேலும் வாசிக்க",
    },
  },
} as const;
