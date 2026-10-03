import Image from "next/image";
import Link from "next/link";
import { t } from "@/content/ta-LK";

const logos = [
  { src: "/logos/logo-anbin.webp" },
  { src: "/logos/logo-mandram.webp" },
] as const;

export function SiteLogo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label={t.siteName}>
      <span className="flex shrink-0 items-center gap-1.5">
        {logos.map((logo) => (
          <Image
            key={logo.src}
            src={logo.src}
            alt=""
            width={256}
            height={256}
            unoptimized
            className={`h-10 w-10 rounded-full max-[359px]:h-9 max-[359px]:w-9 sm:h-11 sm:w-11 ${compact ? "xl:h-[3.25rem] xl:w-[3.25rem]" : ""}`}
          />
        ))}
      </span>
      <span className={`hidden flex-col leading-tight sm:flex ${compact ? "xl:hidden" : ""}`}>
        <span className={`font-heading text-lg font-bold ${light ? "text-white" : "text-brand"}`}>
          {t.siteShortName}
        </span>
        <span className={`max-w-72 text-xs ${light ? "text-white/80" : "text-muted"}`}>
          {t.siteSubName}
        </span>
      </span>
    </Link>
  );
}
