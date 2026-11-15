# Live, staging and your computer

The website runs in three places. Each has its own database and its own photo bucket, so a test can never damage the real site.

| | Live website | Staging website (test copy) | Your computer |
|---|---|---|---|
| Address | https://anpinpathai.org | https://staging--anpinpathai.netlify.app | http://localhost:3000 |
| Git branch | `master` | `staging` | whatever you are working on |
| Database (Neon branch) | `production` | `staging` | `staging` |
| Photo bucket (R2) | live bucket, `media.anpinpathai.org` | `anpinpathai-media-staging` | `anpinpathai-media-staging` (or `dummy`: photos stay in a folder on the computer) |
| Backups | weekly, private bucket `anbinpathai-backups` | none | none |
| Hidden from Google | no | **yes** | not online |

Nothing on your computer holds a live address, password or key. The live values exist only in Netlify (Production), in the GitHub backup secrets, and in your password manager.

## Everyday work

1. Work on your computer. It uses the staging database, so test posts and test accounts are safe.
2. Push to the `staging` branch. Netlify builds the staging website. Test it there, with the staging admin login (a copy of the live one).
3. Happy? Merge `staging` into `master`. Netlify builds the live site.

The staging website shows a yellow **STAGING** strip at the top of every page, and asks search engines to ignore it.

## Start over with today's real data

Neon → project → branch `staging` → **Reset from parent**. Staging becomes a fresh copy of live. All test posts, test accounts and test database changes on staging are lost. Live is never touched, and the staging addresses do not change. Photos in R2 are not affected.
Old posts show broken photos on staging, because their files are in the live bucket. New test uploads work.

## Changing the database structure (migrations)

1. Run it on staging first: `npm run db:migrate` (with your normal `.env.local`). Test the staging website.
2. When it works, run it once on the live database, on purpose (PowerShell):

```
$env:DATABASE_URL_UNPOOLED = "<live direct address: Neon > branch production > Connect, pooling OFF>"
$env:I_KNOW_THIS_IS_LIVE = "yes"
npm run db:migrate
Remove-Item Env:DATABASE_URL_UNPOOLED, Env:I_KNOW_THIS_IS_LIVE
```

Always take a backup first (Actions → Weekly database backup → Run workflow).

## The safety catch

These commands change data: `db:seed`, `db:migrate`, `restore --yes`, `admin:create`, `cleanup:photos --delete`. They only run when your `.env.local` contains the two lines below. **Put them only in your own `.env.local`, on your computer. Do not add them in Netlify (live or staging) or in GitHub.** The website never reads them, and Netlify never runs these commands.

```
ALLOWED_DB_ENDPOINT=<the ep-... name of the staging branch>
ALLOWED_R2_BUCKET=anpinpathai-media-staging
```

and the database and bucket in `.env.local` really are those. If not, the command stops and changes nothing. To change the live site on purpose (for example a new live admin password), give the live address as above and add `--i-know-this-is-live` (or `I_KNOW_THIS_IS_LIVE=yes`):

```
$env:DATABASE_URL_UNPOOLED = "<live direct address>"
npm run admin:create -- --i-know-this-is-live
Remove-Item Env:DATABASE_URL_UNPOOLED
```

`npm run backup` is not blocked. It only reads the database and writes to the private backup bucket.

## One-time setup of the staging website in Netlify

1. Create the git branch `staging` (in the repository Netlify reads from).
2. Netlify → Project configuration → Build & deploy → **Branches and deploy contexts** → Branch deploys → let me add individual branches → `staging`.
3. Netlify → Project configuration → **Environment variables**. For each variable below choose "different value for each deploy context". **Production keeps its current value. Only the Branch deploys value is new.**

| Variable | Production (live) | Branch deploys (staging) |
|---|---|---|
| `DATABASE_URL` | unchanged | staging pooled address |
| `DATABASE_URL_UNPOOLED` | unchanged | staging direct address |
| `SESSION_SECRET` | unchanged | a **new** random value |
| `SITE_URL` | `https://anpinpathai.org` | `https://staging--anpinpathai.netlify.app` |
| `R2_ACCESS_KEY_ID` | unchanged | staging bucket token |
| `R2_SECRET_ACCESS_KEY` | unchanged | staging bucket token |
| `R2_BUCKET` | unchanged | `anpinpathai-media-staging` |
| `R2_PUBLIC_URL` | `https://media.anpinpathai.org` | the staging public address (`https://pub-….r2.dev`) |
| `SITE_ENV` | `production` (only the exact word `staging` switches the test mode on) | `staging` |

`R2_ACCOUNT_ID` is the same for both. Make every variable available to Builds, Functions and Runtime.

4. Deploy the `staging` branch and check: the address opens, the yellow STAGING strip shows, `/robots.txt` says `Disallow: /`, and the live site still works.

## The Registry of writers and artists: going live for the first time

The Registry (`/directory`, the admin group **Registry**) adds four new tables to the database (`directory_fields`, `directory_entries`, `directory_reviews`, `directory_activity`, in `drizzle/0007_*.sql`), and a second, small file `drizzle/0008_*.sql` adds two empty columns to `directory_reviews` (the locked copies of a reviewer's link and password, so the admin can look at them again). Both files only add things; nothing that exists is changed. It is hidden on the website until the admin switches it on, so deploying the code shows nothing new to visitors.

The locked copies are made with a key built from `SESSION_SECRET`. If that secret is ever changed, the admin can no longer see an old reviewer's link and password on the Reviewers page (the link and the password themselves still work, and reviewers only have to type the password again): to see them again, press **Edit** on the reviewer and give a new password.

The order for the live site:
1. Test everything on staging first. The staging database already has the tables.
2. Take a backup (GitHub → Actions → Weekly database backup → Run workflow).
3. Add the tables and the two columns to the **live** database, on purpose, **before** the new code goes live: either with `npm run db:migrate` (see "Changing the database structure" above; both `0007` and `0008` must run), or by hand in the Neon console with `docs/registry-live-setup.sql` (see "Step 3 by hand" below). Either one is enough (the file also writes the form questions); if both are run, the second one finds nothing to do.
4. Merge the branch into `master` and press Sync fork. Netlify builds the live site.
5. When you are ready to announce it: Admin → Registry page text → switch on **Show the Registry on the website** → Save.

New text is written to the database the first time the Registry is used: the standard questions of the form appear in **Registry → Form questions** (and are never overwritten after that).

### Step 3 by hand, in the Neon console (no command line)

`docs/registry-live-setup.sql` does everything step 3 does, and writes the form questions too (the 29 standard ones as they were on staging when the file was made, plus **Date of birth**: a private, optional Date question). It also records `0007` and `0008` as done, so `npm run db:migrate` never runs them a second time. It was tested on copies of the database (as live is today), twice in a row, and its result is identical to what `db:migrate` builds. It only adds; it is safe to run twice; and it stops with a **STOPPED:** message, changing nothing, if it is run on the wrong database.

1. Take a backup first (below).
2. Neon console → your project → the branch **production** (check the name at the top) → **SQL Editor**.
3. Open `docs/registry-live-setup.sql` in VS Code, press Ctrl+A, Ctrl+C. In the SQL Editor press Ctrl+A (to clear the editor), then Ctrl+V, then **Run**.
4. At the very end it shows one small table. It must say `tables_found 4 | reviewer_columns 2 | questions 30 | updates_recorded 2`.
5. If a red message starts with **STOPPED:**, nothing was changed: read it. Any other error: copy the message and ask the developer. Do not run pieces of the file by hand.

If the questions on staging are changed again before going live, ask the developer to make the file again, so live gets the same questions. After go-live, questions are changed in the admin panel of each website separately (staging and live do not share them).

## Backing up before a live change

A. **The database, two ways (do both).**
1. GitHub → the repository → **Actions** → *Weekly database backup* → **Run workflow** → **Run workflow**. Wait for the green tick (a minute or two).
2. Cloudflare → R2 → the private bucket `anbinpathai-backups` → folder `backups/`: the newest file `db-YYYYMMDD-HHMM.json.gz` is today's (the time is UTC). Download a copy to your computer if you like. It holds the posts, categories, settings, committee and the admin login. It does **not** hold photos (see B), and it does **not** hold the Registry tables yet.
3. Neon → the project → **Branches** → **Create branch**, parent **production**, name `before-registry`, current data. This is an instant, complete copy of everything in the database. Delete the branch a few days after the live change is working.

B. **The photos (Cloudflare R2), once, with rclone.**
1. Cloudflare → R2 → Overview: copy the **Account ID**, and note the name of the live photo bucket (the one behind `media.anpinpathai.org`; it is also `R2_BUCKET` in Netlify).
2. R2 → **Manage API tokens** → **Create API token**: permission **Object Read only**, for the photo bucket only. Copy the Access Key ID and the Secret Access Key (shown once) into your password manager.
3. PowerShell: `winget install Rclone.Rclone`, then close and open PowerShell again.
4. `rclone config` → **n** (new remote) → name `r2live` → storage type `s3` → provider `Cloudflare` → paste the two keys → endpoint `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` → press Enter for everything else → keep the remote → quit.
5. Copy all photos to a folder outside the project: `rclone copy r2live:<photo-bucket> "$HOME\Desktop\anpinpathai-photos-backup" --progress`. It only reads from R2; run it again later and it downloads only new photos.
6. Check: `rclone check r2live:<photo-bucket> "$HOME\Desktop\anpinpathai-photos-backup" --one-way` says 0 differences.
Keep the folder on another drive or in cloud storage. Photos change rarely: repeat once a month, or after many new uploads.
