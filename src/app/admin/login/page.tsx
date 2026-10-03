import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { admin } from "@/content/admin-en";
import { t } from "@/content/ta-LK";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-center gap-2">
          <Image src="/logos/logo-anbin.webp" alt="" width={56} height={56} unoptimized className="h-14 w-14 rounded-full" />
          <Image src="/logos/logo-mandram.webp" alt="" width={56} height={56} unoptimized className="h-14 w-14 rounded-full" />
        </div>
        <p className="mt-3 text-center text-sm text-muted">{t.siteName}</p>
        <h1 className="mt-4 text-center text-2xl text-brand">{admin.login.title}</h1>
        <LoginForm />
      </div>
      <p className="mt-6 text-center">
        <Link href="/" className="text-sm font-semibold text-brand underline-offset-4 hover:underline">
          {admin.login.backToSite}
        </Link>
      </p>
    </main>
  );
}
