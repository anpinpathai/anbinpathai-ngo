export type ColorKey = "red" | "green" | "purple" | "blue" | "teal";

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
  { slug: "students", name: "எண்ணம்போல் வாழ்க்கை மாணவர் மன்றம்", colorKey: "teal", href: "/activities/students" },
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

// Pothigai internet radio. It only appears on the site once a stream address is saved in Settings.
export const radio = {
  name: "பொதிகை இணைய வானொலி",
  navLabel: "பொதிகை வானொலி",
  href: "/radio",
  description:
    "எமது கலை இலக்கிய செயற்பாடுகளின் ஒலிவடிவம் மற்றும் தமிழிசைப் பாடல்களுடன் ஒலிபரப்பாகும் இணைய வானொலி",
  live: "நேரலை",
  listen: "நேரலையில் கேட்க",
  loading: "ஏற்றுகிறது…",
  nowPlaying: "இப்போது ஒலிபரப்பாகிறது",
  play: "வானொலியை இயக்க",
  stop: "வானொலியை நிறுத்த",
  retry: "மீண்டும் முயற்சிக்க",
  close: "மூடு",
  openPage: "வானொலிப் பக்கத்திற்குச் செல்க",
  error: "வானொலி இப்போது கிடைக்கவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.",
  hearTitle: "நீங்கள் கேட்கலாம்",
  hear: ["எமது கலை இலக்கிய செயற்பாடுகளின் ஒலிவடிவம்", "தமிழிசைப் பாடல்கள்"],
  howTitle: "எவ்வாறு கேட்பது?",
  how: [
    "மேலே உள்ள இயக்கு பொத்தானை அழுத்துங்கள்.",
    "வேறு பக்கங்களுக்குச் சென்றாலும் வானொலி தொடர்ந்து ஒலிக்கும்.",
    "நிறுத்த, நிறுத்து பொத்தானை அழுத்துங்கள்.",
  ],
} as const;

export const postFallbackTitles = {
  photos: "புகைப்படப் பதிவு",
  video: "காணொளிப் பதிவு",
  post: "பதிவு",
} as const;

export const months = [
  "ஜனவரி",
  "பெப்ரவரி",
  "மார்ச்",
  "ஏப்ரல்",
  "மே",
  "ஜூன்",
  "ஜூலை",
  "ஓகஸ்ட்",
  "செப்டெம்பர்",
  "ஒக்டோபர்",
  "நவம்பர்",
  "டிசம்பர்",
] as const;

export const postText = {
  latestTitle: "அண்மைய பதிவுகள்",
  tabsLabel: "பிரிவுகள்",
  viewAll: "அனைத்துப் பதிவுகளையும் காண்க",
  empty: "இந்தப் பிரிவில் இன்னும் பதிவுகள் இல்லை.",
  readMore: "மேலும் வாசிக்க",
  photos: (n: number) => `${n} படங்கள்`,
  video: "காணொளி",
  facebookPost: "பேஸ்புக் பதிவு",
  newer: "புதிய பதிவுகள்",
  older: "பழைய பதிவுகள்",
  pageOf: (page: number, pages: number) => `பக்கம் ${page} / ${pages}`,
  home: "முகப்பு",
  related: "இதே பிரிவின் மேலும் பதிவுகள்",
  viewOnFacebook: "பேஸ்புக்கில் பார்க்க",
  watchOnYoutube: "யூடியூப்பில் பார்க்க",
  share: "பகிர்க",
  // The three share buttons are in English with icons, as the client asked (everyone knows these names).
  shareFacebook: "Facebook",
  shareWhatsapp: "WhatsApp",
  copyLink: "Copy link",
  copied: "Copied",
  copyFailed: "நகலெடுக்க முடியவில்லை. தயவுசெய்து கைமுறையாக நகலெடுக்கவும்.",
  scrollPrev: "முந்தைய பதிவுகள்",
  scrollNext: "அடுத்த பதிவுகள்",
  pause: "தானாக நகர்வதை நிறுத்து",
  play: "தானாக நகர்வதை இயக்கு",
  gallery: {
    open: "படத்தைப் பெரிதாகப் பார்க்க",
    close: "மூடு",
    prev: "முந்தைய படம்",
    next: "அடுத்த படம்",
    count: (n: number, total: number) => `படம் ${n} / ${total}`,
    more: (n: number) => `+${n}`,
  },
  error: {
    title: "ஏதோ தவறு நடந்துவிட்டது",
    text: "பக்கத்தை ஏற்ற முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.",
    retry: "மீண்டும் முயற்சிக்க",
  },
  notFound: {
    title: "பக்கம் கிடைக்கவில்லை",
    text: "நீங்கள் தேடிய பக்கம் இல்லை அல்லது நகர்த்தப்பட்டுள்ளது.",
    button: "முகப்புப் பக்கத்திற்குச் செல்க",
  },
} as const;

export type ContentGroup = { title?: string; items: readonly string[]; chips?: boolean };

export const categoryContent: Record<string, { lead?: string; groups: readonly ContentGroup[] }> = {
  social: {
    groups: [
      {
        title: "எமது சமூகப் பணிகள்",
        items: [
          "இடர் நிவாரணம்",
          "பசித்தோருக்கு உதவுதல்",
          "வாழ்வாதார உதவிகள்",
          "மருத்துவ உதவிகள்",
          "சிறுவர் இல்லங்களுக்கான உதவிகள்",
          "முதியோர் இல்லங்களுக்கான உதவிகள்",
          "முன்பள்ளிகளுக்கான உதவிகள்",
          "பெண்மையைப் போற்றுவோம் விருது",
        ],
      },
      {
        title: "கல்வி உதவிகள்",
        items: [
          "கற்றல் உபகரணங்கள்",
          "பாதணிகள்",
          "விளையாட்டு உபகரணங்கள்",
          "பாடசாலை உதவிகள்",
          "கட்டுமானப் பணிகள்",
          "கல்வி நிதி",
        ],
      },
    ],
  },
  green: {
    lead: "பசுமையான நாளைக்காக…",
    groups: [
      {
        title: "எமது சுற்றுச்சூழல் நடவடிக்கைகள்",
        items: [
          "சிரமதானப் பணிகள்",
          "இயற்கைப் பாதுகாப்புப் பிரச்சாரங்கள்",
          "பொலித்தீன் மற்றும் பிளாஸ்டிக் கட்டுப்பாடு",
          "போதைக்கு எதிரான விழிப்புணர்வு",
        ],
      },
    ],
  },
  arts: {
    groups: [
      {
        items: ["கவிதை", "சிறுகதை", "கட்டுரை", "பேச்சு", "நாடகம்", "நடிப்பு", "வாசிப்பு", "இலக்கிய உரையாடல்"],
        chips: true,
      },
      {
        title: "மேலும்",
        items: [
          "இலக்கிய சந்திப்புகள்",
          "எழுத்தாளர் அறிமுகங்கள்",
          "நூல் வெளியீடுகள்",
          "கவியரங்குகள்",
          "பேச்சுப் போட்டிகள்",
          "இலக்கியப் போட்டிகள்",
          "பயிற்சிப் பட்டறைகள்",
        ],
      },
    ],
  },
};

export const pages = {
  about: {
    title: "எங்களைப் பற்றி",
    aimQuote: "மண்ணும் மனிதமும் காப்போம்.",
    goalsTitle: "எமது இலக்குகள்",
    goals: [
      "குழந்தைகள் மற்றும் இளைஞர்களிடையே வாசிப்புப் பழக்கத்தை வளர்த்தல்",
      "தமிழ் கலை மற்றும் இலக்கியத்தை ஊக்குவித்தல்",
      "மாணவர்களின் திறமைகளை வெளிக்கொணருதல்",
      "சமூகத்தில் மனிதநேயத்தை வளர்த்தல்",
      "சுற்றுச்சூழல் பாதுகாப்பை ஊக்குவித்தல்",
      "முதியோர் மற்றும் தேவையுடையோருக்கு ஆதரவளித்தல்",
    ],
    teamButton: "நிர்வாகசபையைப் பார்க்க",
    contactButton: "எம்முடன் தொடர்புகொள்ள",
  },
  team: {
    title: "நிறைவேற்று நிர்வாகசபை",
    leadershipTitle: "நிர்வாகத் தலைமை",
    empty: "நிர்வாகசபை விபரங்கள் விரைவில் சேர்க்கப்படும்.",
  },
  reading: {
    featuredTitle: "புதிய காணொளி",
    channelText: "எமது யூடியூப் அலைவரிசையைப் பின்தொடருங்கள்",
    channelButton: "யூடியூப் அலைவரிசைக்குச் செல்க",
    videosTitle: "வாசிப்புப் பதிவுகள்",
    watch: "பார்க்க",
  },
  donate: {
    title: "நன்கொடை",
    intro: "உங்கள் ஆதரவு எமது கல்வி, சுற்றுச்சூழல் மற்றும் மனிதநேயப் பணிகளுக்கு வலுச்சேர்க்கும். வங்கிக் கணக்கு மூலம் நன்கொடை வழங்கலாம்.",
    bankTitle: "வங்கி விபரங்கள்",
    bankName: "வங்கியின் பெயர்",
    branch: "கிளை",
    accountName: "கணக்கின் பெயர்",
    accountNumber: "கணக்கு இலக்கம்",
    note: "மேலதிக குறிப்பு",
    // English with an icon, as the client asked (same as the share buttons on a post).
    copy: "Copy",
    copied: "Copied",
    soon: "வங்கி விபரங்கள் விரைவில் சேர்க்கப்படும். நன்கொடை பற்றி அறிய எம்மைத் தொடர்புகொள்ளுங்கள்.",
    afterTitle: "நன்கொடை வழங்கிய பின்",
    afterText: "நன்கொடை வழங்கியதும் எமக்குத் தெரியப்படுத்துங்கள். நன்றி!",
    contactButton: "தொடர்புகொள்ள",
  },
  contact: {
    title: "தொடர்பு",
    intro: "எம்முடன் தொடர்புகொள்ளுங்கள்.",
    memberTitle: "உறுப்பினராகுங்கள்",
    memberText: "எமது பணிகளில் இணைந்து உறுப்பினராக விரும்புவோர் எம்மைத் தொடர்புகொள்ளுங்கள்.",
    phone: "தொலைபேசி இலக்கம்",
    email: "மின்னஞ்சல்",
    address: "முகவரி",
    map: "வரைபடத்தில் பார்க்க",
    followTitle: "எங்களைப் பின்தொடருங்கள்",
    soon: "தொடர்பு விபரங்கள் விரைவில் சேர்க்கப்படும்.",
  },
} as const;

export const roleGroups = [
  { key: "director", title: "பணிப்பாளர்", heading: "பணிப்பாளர்" },
  { key: "president", title: "தலைவர்", heading: "தலைவர்" },
  { key: "secretary", title: "செயலாளர்", heading: "செயலாளர்" },
  { key: "treasurer", title: "பொருளாளர்", heading: "பொருளாளர்" },
  { key: "member", title: "உறுப்பினர்", heading: "உறுப்பினர்கள்" },
  { key: "patron", title: "போசகர்", heading: "போசகர்கள்" },
] as const;

export const t = {
  siteName: "அன்பின்பாதை எண்ணம்போல் வாழ்க்கை கலை இலக்கிய மன்றம் – திருகோணமலை",
  siteLines: ["அன்பின்பாதை எண்ணம்போல் வாழ்க்கை", "கலை இலக்கிய மன்றம் – திருகோணமலை"],
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
    since: "2019 முதல் தொடரும் எமது பணிகள்",
    linksTitle: "முக்கிய இணைப்புகள்",
    rights: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
    contactTitle: "தொடர்புகளுக்கு",
    followTitle: "எங்களைப் பின்தொடருங்கள்",
    // English with icons, like the share buttons (the client asked; everyone knows these two names).
    facebook: "Facebook",
    youtube: "YouTube",
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
    activitiesTitle: "எமது செயற்பாடுகள்",
    learnMore: "மேலும் அறிய",
    blurbs: {
      social: "இடர் நிவாரணம் · பசித்தோருக்கு உதவுதல் · கல்வி உதவிகள்",
      green: "பசுமையான நாளைக்காக… சிரமதானம் · இயற்கைப் பாதுகாப்பு · போதைக்கு எதிரான விழிப்புணர்வு",
      arts: "கவிதை · சிறுகதை · கட்டுரை · பேச்சு · நாடகம் · இலக்கிய உரையாடல்",
      students: "மாணவர்களின் திறமைகளை வெளிக்கொணருதல்",
      reading: "யூடியூப் வாசிப்பு முயற்சி",
    },
    aboutTitle: "எமது பயணம்",
    aboutText:
      "அன்பின்பாதை எண்ணம்போல் வாழ்க்கை கலை இலக்கிய மன்றம் – திருகோணமலை சமூக, கலை, இலக்கிய மற்றும் கல்வி சார்ந்த செயற்பாடுகளை முன்னெடுத்து வரும் அமைப்பாகும். 2019 முதல் தொடரும் எமது பணிகள், சமூகத்தின் பல்வேறு தரப்பினரையும் இணைத்து மனிதநேயம், கல்வி, கலை, இலக்கியம் மற்றும் சுற்றுச்சூழல் பாதுகாப்பை முன்னெடுப்பதை நோக்கமாகக் கொண்டுள்ளன.",
    aimLabel: "எமது நோக்கம்",
    initiativesTitle: "முக்கியப் பிரிவுகள்",
    initiatives: [
      { name: "அன்பின் பாதை சமூகம்", href: "/activities/social", colorKey: "red" },
      { name: "எண்ணம்போல் வாழ்க்கை கலை இலக்கிய மன்றம்", href: "/activities/arts", colorKey: "purple" },
      { name: "எண்ணம்போல் வாழ்க்கை மாணவர் மன்றம்", href: "/activities/students", colorKey: "teal" },
      { name: "வாசிப்போம் சுவாசிப்போம்", href: "/reading", colorKey: "blue" },
      { name: "பெண்மையைப் போற்றுவோம்", colorKey: "red" },
      { name: "“சிறுகதை மஞ்சரி” அனைத்துலக வாசகர் வட்டம்", colorKey: "purple" },
      { name: "பசுமைத் தாயகம்", href: "/activities/green", colorKey: "green" },
    ],
    donate: {
      title: "எமது பணிகளுக்கு உதவுங்கள்",
      text: "உங்கள் ஆதரவு எமது கல்வி, சுற்றுச்சூழல் மற்றும் மனிதநேயப் பணிகளுக்கு வலுச்சேர்க்கும்.",
      button: "நன்கொடை வழங்குங்கள்",
    },
  },
} as const;
