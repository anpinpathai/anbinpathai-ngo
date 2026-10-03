import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/admin/Icon";
import { admin } from "@/content/admin-en";
import { t } from "@/content/ta-LK";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";

function Logos({ size }: { size: string }) {
  return (
    <span className="flex items-center -space-x-2">
      {["/logos/logo-anbin.webp", "/logos/logo-mandram.webp"].map((src) => (
        <Image key={src} src={src} alt="" width={160} height={160} unoptimized className={`${size} rounded-full ring-2 ring-white`} />
      ))}
    </span>
  );
}

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");

  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-[#4a1d8f] p-12 text-white lg:flex">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gold/25 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <Logos size="h-16 w-16" />
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight">{admin.login.sideTitle}</h2>
          <p className="mt-4 max-w-md text-lg text-white/80">{admin.login.sideText}</p>
        </div>
        <p lang="ta" className="relative max-w-md text-sm leading-relaxed text-white/70">
          {t.siteName}
        </p>
      </section>

      <section className="flex flex-col justify-center px-5 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <Logos size="h-14 w-14" />
            <p lang="ta" className="text-center text-sm text-muted">
              {t.siteName}
            </p>
          </div>

          <h1 className="text-3xl font-bold text-brand-dark">{admin.login.welcome}</h1>
          <p className="mt-2 text-muted">{admin.login.subtitle}</p>

          <LoginForm />

          <p className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-brand"
            >
              <Icon name="arrowLeft" className="h-4 w-4" />
              {admin.login.backToSite}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
