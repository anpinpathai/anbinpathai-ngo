import Image from "next/image";
import Link from "next/link";
import { directory } from "@/content/ta-LK";
import type { PublicCard } from "@/lib/directory/public";
import { initialOf } from "@/lib/names";
import { ArrowRightIcon, PinIcon } from "./icons";

// `border` is the ring around a photo: thick on a big picture, thin on a small one.
export function Avatar({
  name,
  photoUrl,
  size = "h-24 w-24",
  text = "text-3xl",
  border = "border-4",
}: {
  name: string;
  photoUrl: string | null;
  size?: string;
  text?: string;
  border?: string;
}) {
  return photoUrl ? (
    <Image
      src={photoUrl}
      alt={directory.ui.photoOf(name)}
      width={320}
      height={320}
      unoptimized
      className={`${size} shrink-0 rounded-full ${border} border-sand object-cover`}
    />
  ) : (
    <span
      aria-hidden="true"
      className={`${size} ${text} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-dark font-heading font-bold text-white`}
    >
      {initialOf(name)}
    </span>
  );
}

// One person in the list: a card with a big round photo, the name, the place, up to three fields of art and a "view
// details" line, all centred. The whole card is one big link, so it is easy to tap.
export function PersonCard({ card }: { card: PublicCard }) {
  const shown = card.artFields.slice(0, 3);
  const more = card.artFields.length - shown.length;

  return (
    <Link
      href={`${directory.href}/${card.code}`}
      className="group flex h-full min-w-0 flex-col items-center rounded-3xl border border-line bg-white p-4 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold motion-reduce:transition-none motion-reduce:hover:translate-y-0 min-[480px]:p-5"
    >
      {/* A little smaller on a narrow phone, so a card is not taller than it needs to be. */}
      <Avatar name={card.name} photoUrl={card.photoUrl} size="h-20 w-20 min-[480px]:h-24 min-[480px]:w-24" text="text-2xl min-[480px]:text-3xl" />
      <h3 className="mt-4 text-lg font-bold leading-snug text-ink [overflow-wrap:anywhere] group-hover:text-brand">{card.name}</h3>
      {card.place && (
        // The pin is part of the first line of the text, so it always sits right beside the words, however the place wraps.
        <p className="mt-1 text-balance text-sm leading-snug text-muted [overflow-wrap:anywhere]">
          <PinIcon className="mr-1 inline-block h-4 w-4 align-[-0.2em] text-brand/60" />
          {card.place}
        </p>
      )}
      {shown.length > 0 && (
        <ul className="mt-3 flex flex-wrap justify-center gap-1.5">
          {shown.map((field) => (
            <li key={field} className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-brand">
              {field}
            </li>
          ))}
          {more > 0 && <li className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-muted">+{more}</li>}
        </ul>
      )}
      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-brand">
        {directory.ui.viewProfile}
        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </span>
    </Link>
  );
}
