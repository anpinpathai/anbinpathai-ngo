export const FACEBOOK_HOSTS = ["facebook.com", "fb.com", "fb.me", "fb.watch"];
export const YOUTUBE_HOSTS = ["youtube.com", "youtu.be"];

export function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function isHttpsUrlOnHosts(value: string, hosts: string[]) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return hosts.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}
