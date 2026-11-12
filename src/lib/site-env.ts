// True only on the test copy of the website (Netlify "Branch deploys"), where SITE_ENV=staging is set.
// The live site and your own computer do not set it, so for them everything stays exactly as before.
export function isStaging() {
  return process.env.SITE_ENV === "staging";
}
