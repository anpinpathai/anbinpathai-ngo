// Small pictures used by the radio player. Plain SVG, so they work in server and client components.

export function RadioIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <circle cx="12" cy="12" r="2" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
    </svg>
  );
}

export function PlayIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 ${className}`}>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.1-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

export function StopIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 ${className}`}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

export function CloseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className={`shrink-0 ${className}`}
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function SpinnerIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      className={`shrink-0 animate-spin motion-reduce:animate-none ${className}`}
    >
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}

// Moving sound bars. They only move while the radio is playing.
export function Equalizer({ active, className = "" }: { active: boolean; className?: string }) {
  return (
    <span aria-hidden="true" data-active={active} className={`radio-eq flex h-6 items-end gap-1 ${className}`}>
      <span className="h-full w-1 rounded-full bg-gold" />
      <span className="h-full w-1 rounded-full bg-gold" />
      <span className="h-full w-1 rounded-full bg-gold" />
      <span className="h-full w-1 rounded-full bg-gold" />
    </span>
  );
}
