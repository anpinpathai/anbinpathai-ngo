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

export function TeamCard({ member, large = false }: { member: TeamCardData; large?: boolean }) {
  const photo = publicUrl(member.photoKey);
  const size = large ? "h-36 w-36 sm:h-40 sm:w-40" : "h-24 w-24 sm:h-28 sm:w-28";

  return (
    <div className="flex h-full min-w-0 flex-col items-center rounded-2xl border border-line bg-white p-6 text-center [overflow-wrap:anywhere]">
      {photo ? (
        <Image
          src={photo}
          alt=""
          width={400}
          height={400}
          unoptimized
          className={`${size} rounded-full border-4 border-sand object-cover`}
        />
      ) : (
        <span
          aria-hidden="true"
          className={`${size} grid place-items-center rounded-full bg-gradient-to-br from-brand to-brand-dark font-heading font-bold text-white ${
            large ? "text-5xl" : "text-4xl"
          }`}
        >
          {initialOf(member.name)}
        </span>
      )}
      <p className={`mt-4 font-heading font-bold text-ink ${large ? "text-xl" : "text-lg"}`}>{member.name}</p>
      <p className="mt-1 font-semibold text-brand">{member.roleTitle}</p>
      {member.subtitle && <p className="text-sm text-muted">{member.subtitle}</p>}
    </div>
  );
}
