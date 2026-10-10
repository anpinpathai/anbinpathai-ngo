import Image from "next/image";
import { initialOf } from "@/lib/names";
import { publicUrl } from "@/lib/storage";

export type TeamCardData = {
  id: number;
  name: string;
  roleTitle: string;
  subtitle: string | null;
  photoKey: string | null;
};

// On a phone: the photo on the left with the name and role beside it, and the longer line (for example a
// qualification) under them across the whole card. From 640px up: the centred, stacked card.
export function TeamCard({ member, large = false }: { member: TeamCardData; large?: boolean }) {
  const photo = publicUrl(member.photoKey);
  const size = large ? "h-20 w-20 sm:h-40 sm:w-40" : "h-16 w-16 sm:h-28 sm:w-28";

  return (
    <div className="flex h-full min-w-0 flex-col items-start gap-3 rounded-2xl border border-line bg-white p-4 text-left [overflow-wrap:anywhere] sm:items-center sm:gap-0 sm:p-6 sm:text-center">
      <div className="flex w-full min-w-0 items-center gap-4 sm:flex-col sm:gap-0">
        {photo ? (
          <Image
            src={photo}
            alt=""
            width={400}
            height={400}
            unoptimized
            className={`${size} shrink-0 rounded-full border-4 border-sand object-cover`}
          />
        ) : (
          <span
            aria-hidden="true"
            className={`${size} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-dark font-heading font-bold text-white ${
              large ? "text-3xl sm:text-5xl" : "text-2xl sm:text-4xl"
            }`}
          >
            {initialOf(member.name)}
          </span>
        )}
        <div className="min-w-0 sm:mt-4">
          <p className={`font-heading font-bold leading-snug text-ink ${large ? "text-lg sm:text-xl" : "text-base sm:text-lg"}`}>
            {member.name}
          </p>
          <p className="mt-0.5 font-semibold text-brand sm:mt-1">{member.roleTitle}</p>
        </div>
      </div>
      {member.subtitle && <p className="text-sm leading-snug text-muted sm:leading-normal">{member.subtitle}</p>}
    </div>
  );
}
