# Launch and handover checklist

For the developer. Tick each step. Nothing here needs code changes.

## 1. Accounts owned by the NGO
Create these under the NGO's own email, with a password manager entry for each:
- GitHub (repository) · Netlify (hosting) · Neon (database) · Cloudflare (photo storage, DNS)
- Turn on two-step login on all four.

## 2. Move the code
- Transfer the GitHub repository to the NGO account (Settings → Danger zone → Transfer), or push it to a new repository there.

## 3. Database (Neon)
1. In the NGO's Neon account create a project (note: the region cannot be changed later).
2. On your computer, take a copy from the old database: `npm run backup -- --local ./backup`
3. Put the NEW project's connection strings in `.env.local` (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`).
4. `npm run db:migrate`, then `npm run restore -- ./backup/<file>.json.gz --yes`.
5. If the admin login was not restored, run `npm run admin:create`.
6. Turn on Neon usage alerts (Billing / Usage).

## 4. Photos (Cloudflare R2)
1. Create a bucket in the NGO's Cloudflare account and an API token (Object Read & Write, that bucket only).
2. Copy the old photos over: `rclone copy old-r2:<old-bucket> new-r2:<new-bucket>` (or download and upload in the dashboard). Photo paths are stored as keys, so nothing in the database changes.
3. Bucket → Settings → **Custom Domains**: connect something like `media.yourdomain.org`. Do not use the `r2.dev` address for the live site, because it is rate-limited.
4. Set `R2_PUBLIC_URL` to the custom domain.

## 5. Netlify
1. New site → import the GitHub repository. Build command and node version come from `netlify.toml`.
2. Environment variables (Site configuration → Environment variables):
   `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `SESSION_SECRET` (new random 48+ characters), `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`, `SITE_URL` (the final https address).
3. Deploy. Free plan = 300 credits a month and the site pauses when they run out: turn on usage emails, and test changes on branch deploys (they cost nothing).
4. Domain: Domain management → add the domain, follow the DNS steps. HTTPS is automatic.

## 6. Backups
- GitHub repository → Settings → Secrets and variables → Actions: add `DATABASE_URL_UNPOOLED`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.
- Actions → "Weekly database backup" → **Run workflow** once and check a file appears in the bucket under `backups/`. The last 12 are kept.
- Photo clean-up (every few months): `npm run cleanup:photos` shows unused photos, add `--delete` to remove them.

## 7. Before announcing
- Fill in Settings (banner, bank details, contact, social links), add committee photos, add the first posts.
- The client reads through `docs/glossary-ta-LK.md` and corrects any Tamil wording (all wording lives in `src/content/ta-LK.ts`).
- Open every menu page on a phone. Share one post link on Facebook and WhatsApp and check the preview picture and text.
- Check `/robots.txt` and `/sitemap.xml` on the live address.

## 8. Handover
- Give the staff `docs/admin-guide.md` and their admin login (change the password after first use: `npm run admin:create` with the same username).
- Remove your personal access from the NGO accounts once everything works.
