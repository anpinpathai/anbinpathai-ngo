import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Admin Panel" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div lang="en" className="admin-en min-h-screen bg-sand/60">
      {children}
    </div>
  );
}
