# Launch and handover checklist

For the developer. Tick each step. Nothing here needs code changes.

## 1. Accounts owned by the NGO
Create these under the NGO's own email, with a password manager entry for each:
- GitHub (repository) · Netlify (hosting) · Neon (database) · Cloudflare (photo storage, DNS)
- Turn on two-step login on all four.

**The domain name (Spaceship)**
1. Create the Spaceship account with the NGO's own email, turn on two-step login, then buy the domain (a `.org` suits an NGO; `.lk` needs a Sri Lankan registrar). Check the renewal price, keep auto-renew and the transfer lock on, and skip hosting, builder and email extras.
2. Check that email straight after buying and confirm the owner's address, or the domain can be suspended after about 15 days.
3. Cloudflare → **Add a domain** → Free plan → note the two Cloudflare nameservers.
4. Spaceship → the domain's **Nameservers** → custom → paste the two Cloudflare nameservers → save. (Turn DNSSEC off first if it is on.) From then on, DNS records are edited in Cloudflare only.
5. Wait until Cloudflare shows the domain as **Active**, then continue with sections 4 and 5 below.

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
   - `netlify.toml` already holds what Netlify needs: the build command, Node 22, the **Next.js runtime plugin**, `publish = ".next"` (never the project's top folder, or every page shows Netlify's "Page not found"), and `SECRETS_SCAN_OMIT_KEYS = "R2_PUBLIC_URL"` (the photo address is public and appears in the pages).
   - `next.config.ts` switches the Next.js build cache off, so no secret value is ever written to a cache file. Netlify's secret scanner would stop the build otherwise. If a build is ever stopped by the scanner again, read which setting and file it names before changing anything.
   - New Netlify projects are **private by default**: only logged-in team members can open them. Before announcing the website, make it public (Project configuration → access / "Adjust settings").
3. Deploy. Free plan = 300 credits a month and the site pauses when they run out: turn on usage emails, and test changes on branch deploys (they cost nothing).
4. Domain (when the domain's nameservers are at Cloudflare, which the photo custom domain needs):
   1. Netlify → Domain management → **Add a domain** → type `yourdomain.org`. Netlify says the DNS is elsewhere and lists the records.
   2. In Cloudflare → the domain → **DNS → Records**, add:
      - `CNAME` · name `@` · value `apex-loadbalancer.netlify.com` (Cloudflare flattens a root-level CNAME). If you prefer, an `A` record `@` → `75.2.60.5` also works.
      - `CNAME` · name `www` · value `<your-site-name>.netlify.app`
      - Set both to **DNS only** (grey cloud), not Proxied. This is the simplest set-up; Netlify's own page does not say either way.
      - Copy the values Netlify shows if they differ from these.
   3. Back in Netlify press **Verify DNS configuration**, then **Provision certificate** (HTTPS). Choose the primary address (for example `yourdomain.org`); Netlify redirects the other one.
   4. Set `SITE_URL` to that final `https://` address and redeploy, so the sitemap and share previews use it.
   5. Keep any existing email records (MX/TXT) that Cloudflare imported. The photo address (`media.…`) is created separately by the R2 Custom Domain step above.

## 6. Backups
- GitHub repository → Settings → Secrets and variables → Actions: add `DATABASE_URL_UNPOOLED`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.
- Actions → "Weekly database backup" → **Run workflow** once and check a file appears in the bucket under `backups/`. The last 12 are kept.
- Photo clean-up (every few months): `npm run cleanup:photos` shows unused photos, add `--delete` to remove them.

## 7. Radio (only if the NGO runs Pothigai Internet Radio)
- AzuraCast needs its own always-on Linux server (a small VPS, about 2 GB RAM). It cannot run on Netlify.
- Give the radio a subdomain with HTTPS (for example `radio.yourwebsite.org`). The website only plays `https://` streams.
- In the admin area: **Radio** → paste the Stream URL (and the optional song-name address) → Save.
- If the NGO plays commercial songs, check whether a music licence is needed in Sri Lanka.

## 8. Before announcing
- Fill in Settings (banner, bank details, contact, social links, radio), add committee photos, add the first posts.
- The client reads through `docs/glossary-ta-LK.md` and corrects any Tamil wording (all wording lives in `src/content/ta-LK.ts`).
- Open every menu page on a phone. Share one post link on Facebook and WhatsApp and check the preview picture and text.
- Check `/robots.txt` and `/sitemap.xml` on the live address.

## 9. Handover
- Give the staff `docs/admin-guide.md` and their admin login (change the password after first use: `npm run admin:create` with the same username).
- Remove your personal access from the NGO accounts once everything works.
