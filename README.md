# அன்பின்பாதை எண்ணம்போல் வாழ்க்கை கலை இலக்கிய மன்றம் – திருகோணமலை

Website for the Anbin Paadhai Ennampol Vazhkai Kalai Ilakkiya Mandram (Trincomalee).
Public site in Sri Lankan Tamil, admin panel in English.

**Stack:** Next.js (App Router) · Neon Postgres · Cloudflare R2 (photos) · Netlify (hosting)

## Run it on your computer

```bash
npm install
cp .env.example .env.local     # then fill in the values (see the comments inside)
npm run db:migrate             # create the database tables
npm run db:seed                # starting data (categories, committee names)
npm run admin:create           # create the admin login (asks for the password)
npm run dev                    # http://localhost:3000   (admin: /admin)
```

## Useful commands

| Command | What it does |
|---|---|
| `npm run build` / `npm start` | Production build and server |
| `npm run backup` | Save a database backup to R2 (`backups/`). Also runs weekly by GitHub Actions |
| `npm run restore -- <backup file>` | Dry run. Add `--yes` to really restore |
| `npm run cleanup:photos` | Lists unused photos in R2. Add `--delete` to remove them |
| `npm run admin:create` | Create or reset the admin password |

## Where things are

- `src/content/ta-LK.ts` – all public Tamil wording (check `docs/glossary-ta-LK.md`)
- `src/content/admin-en.ts` – English admin wording
- `src/app/(site)` – public pages · `src/app/admin` – admin panel
- `docs/admin-guide.md` – guide for the staff · `docs/launch-checklist.md` – going live and handover
