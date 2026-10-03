import type { SettingsValues } from "@/lib/settings";
import { isHttpsUrl } from "@/lib/urls";

export type RadioConfig = { streamUrl: string; nowPlayingUrl: string | null };

// The radio shows on the website only when it is switched on and has a valid https stream address.
// (Browsers refuse to play a plain http stream on an https website.)
export function getRadioConfig(settings: SettingsValues): RadioConfig | null {
  if (settings.radio_enabled === "0") return null;

  const streamUrl = settings.radio_stream_url?.trim();
  if (!streamUrl || !isHttpsUrl(streamUrl)) return null;

  const nowPlayingUrl = settings.radio_nowplaying_url?.trim();
  return { streamUrl, nowPlayingUrl: nowPlayingUrl && isHttpsUrl(nowPlayingUrl) ? nowPlayingUrl : null };
}
