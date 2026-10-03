import Link from "next/link";
import type { ReactNode } from "react";

const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  outline: "border-2 border-brand text-brand hover:bg-brand hover:text-white",
  donate: "bg-gold text-ink hover:bg-ink hover:text-white",
  light: "bg-white text-brand hover:bg-sand",
  outlineLight: "border-2 border-white text-white hover:bg-white hover:text-brand",
} as const;

const sizes = {
  md: "px-6 py-2.5 text-base",
  sm: "px-4 py-1.5 text-sm",
} as const;

export function Button({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
