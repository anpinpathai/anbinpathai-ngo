import { Icon } from "@/components/admin/Icon";
import { PageHeader } from "@/components/admin/PageHeader";
import { card } from "@/components/admin/ui";
import { admin } from "@/content/admin-en";
import { requireAdmin } from "@/lib/session";

export default async function HelpPage() {
  await requireAdmin();
  const { help } = admin;

  return (
    <>
      <PageHeader title={help.title} description={help.intro} icon="help" />

      <div className="space-y-3">
        {help.sections.map((section, index) => (
          <details key={section.title} open={index === 0} className={`${card} group`}>
            <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 font-bold text-brand-dark marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/10 text-sm text-brand">
                {index + 1}
              </span>
              <span className="flex-1">{section.title}</span>
              <Icon name="chevronDown" className="h-5 w-5 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-line/70 px-5 pb-5 pt-4">
              <ol className="space-y-3">
                {section.steps.map((step, stepIndex) => (
                  <li key={step} className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/30 text-xs font-bold text-amber-900">
                      {stepIndex + 1}
                    </span>
                    <span className="text-ink">{step}</span>
                  </li>
                ))}
              </ol>
              {"note" in section && section.note && (
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-brand/5 px-4 py-3 text-sm text-brand-dark">
                  <Icon name="info" className="mt-0.5 h-4 w-4 text-brand" />
                  {section.note}
                </p>
              )}
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
