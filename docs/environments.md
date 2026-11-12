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
