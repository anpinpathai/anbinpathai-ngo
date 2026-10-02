import { connection } from "next/server";

async function loadCategoryNames(): Promise<string[] | null> {
  try {
    const { db } = await import("@/db");
    const { categories } = await import("@/db/schema");
    const { asc } = await import("drizzle-orm");
    const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    return rows.map((r) => r.name);
  } catch (err) {
    console.error("Database check failed:", err);
    return null;
  }
}

export default async function Home() {
  await connection();
  const names = await loadCategoryNames();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">
        அன்பின்பாதை எண்ணம்போல் வாழ்க்கை கலை இலக்கிய மன்றம் – திருகோணமலை
      </h1>
      <p className="mt-2 text-lg">மண்ணும் மனிதமும் காப்போம்</p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">தரவுத்தளச் சோதனை</h2>
        {names === null ? (
          <p className="mt-3 text-red-700">தரவுத்தளத்துடன் இணைக்க முடியவில்லை.</p>
        ) : names.length === 0 ? (
          <p className="mt-3">தரவுத்தளம் இணைந்தது, ஆனால் பிரிவுகள் இன்னும் சேர்க்கப்படவில்லை.</p>
        ) : (
          <ul className="mt-3 list-disc pl-6">
            {names.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
