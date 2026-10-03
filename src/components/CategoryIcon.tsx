const paths: Record<string, string> = {
  social:
    "M12 21s-7.5-4.6-9.6-9.2C1 8.6 2.9 5 6.4 5c2 0 3.5 1 4.3 2.4h.6C12.1 6 13.6 5 15.6 5c3.5 0 5.4 3.6 4 6.8C19.5 16.4 12 21 12 21Z",
  green: "M20 4C10 4 4 9 4 15c0 2 1 3.5 2.5 4.5C7 15 10 11 15 9c-3 3-5 6-5.5 10.5C18 18 20 10 20 4Z",
  arts: "M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25ZM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z",
  reading:
    "M12 6.5C10.5 5.2 8.4 4.5 6 4.5c-1.2 0-2.3.2-3.3.6a1 1 0 0 0-.7.9v11.5c0 .7.7 1.2 1.4 1 .8-.2 1.7-.3 2.6-.3 2.1 0 4 .7 5.5 2 1.5-1.3 3.4-2 5.5-2 .9 0 1.8.1 2.6.3.7.2 1.4-.3 1.4-1V6c0-.4-.3-.8-.7-.9-1-.4-2.1-.6-3.3-.6-2.4 0-4.5.7-6 2Z",
};

export function CategoryIcon({ slug, className = "h-9 w-9" }: { slug: string; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d={paths[slug] ?? paths.social} />
    </svg>
  );
}
