import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { CopyButton } from "@/components/CopyButton";
import { PageHeader } from "@/components/PageHeader";
import { pages } from "@/content/ta-LK";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: pages.donate.title, description: pages.donate.intro };

export default async function DonatePage() {
  const s = await getSettings();
  const text = pages.donate;

  const rows = [
    { label: text.bankName, value: s.bank_name?.trim(), copy: false },
    { label: text.branch, value: s.bank_branch?.trim(), copy: false },
    { label: text.accountName, value: s.bank_account_name?.trim(), copy: true },
    { label: text.accountNumber, value: s.bank_account_number?.trim(), copy: true },
  ].filter((r) => r.value);
  const note = s.bank_note?.trim();
  const hasBank = rows.length > 0;

  return (
    <main>
      <PageHeader title={text.title} lead={<p>{text.intro}</p>} tint="bg-gold/15" />

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
        <section className="rounded-2xl border border-line bg-white p-6 sm:p-8">
          <h2 className="text-2xl text-brand">{text.bankTitle}</h2>
          {hasBank ? (
            <dl className="mt-6 divide-y divide-line">
              {rows.map((row) => (
                <div key={row.label} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <dt className="text-sm text-muted">{row.label}</dt>
                    <dd className="text-xl font-semibold">{row.value}</dd>
                  </div>
                  {row.copy && row.value && <CopyButton value={row.value} />}
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-4 text-muted">{text.soon}</p>
          )}
          {note && (
            <div className="mt-4 rounded-xl bg-sand p-4">
              <p className="text-sm font-semibold text-muted">{text.note}</p>
              <p className="mt-1 whitespace-pre-line">{note}</p>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-sand p-6 sm:p-8">
          <h2 className="text-xl text-brand">{text.afterTitle}</h2>
          <p className="mt-2">{text.afterText}</p>
          <div className="mt-5">
            <Button href="/contact">{text.contactButton}</Button>
          </div>
        </section>
      </div>
    </main>
  );
}
