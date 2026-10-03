// Shared look for the admin panel, so every page feels the same.

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const button = {
  primary: `${buttonBase} bg-brand text-white shadow-sm hover:bg-brand-dark`,
  gold: `${buttonBase} bg-gold text-ink shadow-sm hover:bg-[#f0b90a]`,
  secondary: `${buttonBase} border border-line bg-white text-brand hover:bg-sand/60`,
  danger: `${buttonBase} bg-red-700 text-white shadow-sm hover:bg-red-800`,
  // Quiet text-only button, for "Cancel" next to a main button.
  ghost:
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 font-semibold text-muted transition-colors hover:bg-panel hover:text-brand",
  // Smaller versions for rows and cards.
  small: "inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-sand/60 disabled:opacity-50",
  smallDanger:
    "inline-flex items-center justify-center rounded-lg border border-line bg-white p-2 text-red-700 transition-colors hover:border-red-200 hover:bg-red-50",
  icon: "grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-brand transition-colors hover:bg-sand/60 disabled:opacity-40",
} as const;

export const card = "rounded-2xl border border-line/80 bg-white shadow-sm";

export const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-ink placeholder:text-muted/70 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25";

export function inputClass(error?: string) {
  return `mt-1.5 ${inputBase} ${error ? "border-red-600" : "border-line"}`;
}
