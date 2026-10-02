import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { categories, siteSettings, teamMembers } from "./schema";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  throw new Error("DATABASE_URL_UNPOOLED is not set in .env.local");
}

const db = drizzle(neon(url));

const categoryRows = [
  { slug: "social", name: "அன்பின்பாதை – சமூகப் பணிகள்", colorKey: "red", sortOrder: 1 },
  { slug: "green", name: "பசுமைத் தாயகம்", colorKey: "green", sortOrder: 2 },
  { slug: "arts", name: "கலை & இலக்கியம்", colorKey: "purple", sortOrder: 3 },
  { slug: "reading", name: "வாசிப்போம் சுவாசிப்போம்", colorKey: "blue", sortOrder: 4 },
];

const teamRows = [
  { roleGroup: "director", roleTitle: "பணிப்பாளர்", name: "திருமதி றொசில்டா அன்ரன்" },
  { roleGroup: "president", roleTitle: "தலைவர்", name: "கனக.தீபகாந்தன்" },
  { roleGroup: "secretary", roleTitle: "செயலாளர்", name: "செல்வி அபிநயா ரகுராம்" },
  { roleGroup: "treasurer", roleTitle: "பொருளாளர்", name: "திரு தயாளலிங்கம்.பிரசாதனன்" },
  { roleGroup: "member", roleTitle: "உறுப்பினர்", name: "திருமதி பானு சுதாகரன்" },
  { roleGroup: "member", roleTitle: "உறுப்பினர்", name: "திருமதி.ஐஸ்வர்யா பிரசாதனன்" },
  { roleGroup: "member", roleTitle: "உறுப்பினர்", name: "திருமதி க.மங்களேஸ்வரி" },
  { roleGroup: "member", roleTitle: "உறுப்பினர்", name: "திரு தெ.கரிதரன்" },
  { roleGroup: "member", roleTitle: "உறுப்பினர்", name: "திருமதி காமிலா குரூஸ்" },
  { roleGroup: "member", roleTitle: "உறுப்பினர்", name: "செல்வி மயூரா தீபகாந்தன்" },
  { roleGroup: "member", roleTitle: "உறுப்பினர்", name: "செல்வன் ரகுராம் அபிசிகன்" },
  { roleGroup: "patron", roleTitle: "போசகர்", name: "திரு ந.து.ரகுராம்", subtitle: "வங்கியாளர்" },
  { roleGroup: "patron", roleTitle: "போசகர்", name: "கவிஞர் ஷெல்லிதாசன்" },
] as const;

const settingRows = [
  { key: "site_name", value: "அன்பின்பாதை எண்ணம்போல் வாழ்க்கை கலை இலக்கிய மன்றம் – திருகோணமலை" },
  { key: "site_tagline", value: "மண்ணும் மனிதமும் காப்போம்" },
  { key: "home_headline", value: "எண்ணங்கள் உயர்ந்தால்… வாழ்க்கையும் உயர்கிறது." },
  {
    key: "home_welcome",
    value:
      "கல்வி, கலை இலக்கியம், சமூக சேவை மற்றும் மனிதநேயப் பணிகளின் ஊடாக சமூகத்தில் சிறந்த மாற்றத்தை உருவாக்கும் பயணத்தில் எங்களுடன் இணைந்திடுங்கள்.",
  },
];

async function main() {
  for (const row of categoryRows) {
    await db
      .insert(categories)
      .values(row)
      .onConflictDoUpdate({ target: categories.slug, set: row });
  }

  const existingTeam = await db.select({ id: teamMembers.id }).from(teamMembers).limit(1);
  if (existingTeam.length === 0) {
    await db
      .insert(teamMembers)
      .values(teamRows.map((r, i) => ({ ...r, sortOrder: i + 1 })));
  }

  await db.insert(siteSettings).values(settingRows).onConflictDoNothing();

  console.log("Seed finished.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
