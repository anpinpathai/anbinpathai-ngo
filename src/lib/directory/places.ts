// The places people can pick in the registry form. Safe to use in the browser as well as on the server.
//
// DRAFT: the Tamil spellings of the places must be checked by someone from Trincomalee before launch.
// Sri Lanka has 25 districts, about 331 Divisional Secretariat (DS) divisions and about 14,000 Grama Niladhari (GN)
// divisions. No complete official list with Tamil names was found, so for now:
//   - all 25 districts are lists,
//   - the DS divisions of Trincomalee district are a list (for the other districts the person types the name),
//   - the GN division is typed.
// The full lists can be added here later without changing anything else.

export const SRI_LANKA_DISTRICTS = [
  // Western
  "கொழும்பு",
  "கம்பஹா",
  "களுத்துறை",
  // Central
  "கண்டி",
  "மாத்தளை",
  "நுவரெலியா",
  // Southern
  "காலி",
  "மாத்தறை",
  "அம்பாந்தோட்டை",
  // Northern
  "யாழ்ப்பாணம்",
  "கிளிநொச்சி",
  "மன்னார்",
  "வவுனியா",
  "முல்லைத்தீவு",
  // Eastern
  "மட்டக்களப்பு",
  "அம்பாறை",
  "திருகோணமலை",
  // North Western
  "குருநாகல்",
  "புத்தளம்",
  // North Central
  "அநுராதபுரம்",
  "பொலன்னறுவை",
  // Uva
  "பதுளை",
  "மொனராகலை",
  // Sabaragamuwa
  "இரத்தினபுரி",
  "கேகாலை",
] as const;

// Divisional Secretariat divisions, for the districts where the list is ready.
export const DS_DIVISIONS: Readonly<Record<string, readonly string[]>> = {
  திருகோணமலை: [
    "திருகோணமலை நகரமும் சூழலும்",
    "கிண்ணியா",
    "குச்சவெளி",
    "தம்பலகாமம்",
    "மூதூர்",
    "வெருகல் (ஈச்சிலம்பற்று)",
    "சேருவில",
    "கந்தளாய்",
    "மொறவெவ",
    "கோமரங்கடவல",
    "பதவிசிறிபுர",
  ],
};

// The word shown for "a country that is not in the list".
export const OTHER_COUNTRY = "வேறு நாடு";

// Countries where Sri Lankan Tamils live, the most common first. "வேறு நாடு" lets a person type any other country.
export const COUNTRIES = [
  "கனடா",
  "ஐக்கிய இராச்சியம்",
  "ஜெர்மனி",
  "பிரான்ஸ்",
  "சுவிட்சர்லாந்து",
  "அவுஸ்திரேலியா",
  "நோர்வே",
  "டென்மார்க்",
  "சுவீடன்",
  "நெதர்லாந்து",
  "அமெரிக்கா",
  "இந்தியா",
  "மலேசியா",
  "சிங்கப்பூர்",
  "நியூசிலாந்து",
  "இத்தாலி",
  "பெல்ஜியம்",
  "பின்லாந்து",
  "ஆஸ்திரியா",
  "அயர்லாந்து",
  "ஸ்பெயின்",
  "போர்த்துக்கல்",
  "கிரீஸ்",
  "போலந்து",
  "செக் குடியரசு",
  "ஹங்கேரி",
  "துருக்கி",
  "ஐக்கிய அரபு அமீரகம்",
  "கட்டார்",
  "குவைத்",
  "சவூதி அரேபியா",
  "ஓமான்",
  "பஹ்ரைன்",
  "ஜோர்தான்",
  "லெபனான்",
  "இஸ்ரேல்",
  "எகிப்து",
  "தென்னாபிரிக்கா",
  "கென்யா",
  "மொரிசியஸ்",
  "ஜப்பான்",
  "தென்கொரியா",
  "சீனா",
  "ஹொங்கொங்",
  "தாய்லாந்து",
  "இந்தோனேசியா",
  "பிலிப்பீன்ஸ்",
  "வியட்நாம்",
  "மாலைதீவு",
  "நேபாளம்",
  "பங்களாதேஷ்",
  "பாகிஸ்தான்",
  "பிரேசில்",
  "ஆர்ஜென்டீனா",
  "மெக்சிக்கோ",
  "ரஷ்யா",
  "உக்ரைன்",
  OTHER_COUNTRY,
] as const;

export function dsDivisionsOf(district: string): readonly string[] | null {
  return DS_DIVISIONS[district] ?? null;
}
