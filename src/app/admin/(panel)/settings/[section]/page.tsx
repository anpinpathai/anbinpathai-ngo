import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/admin/Icon";
import { PageHeader } from "@/components/admin/PageHeader";
import { button, card } from "@/components/admin/ui";
import { admin, settingSections } from "@/content/admin-en";
import { requireAdmin } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { publicUrl } from "@/lib/storage";
import { SettingsForm } from "../SettingsForm";

export default async function SettingsSectionPage(props: PageProps<"/admin/settings/[section]">) {
  await requireAdmin();

  const { section: slug } = await props.params;
  const section = settingSections.find((s) => s.slug === slug);
  if (!section) notFound();

  const settings = await getSettings();
  const initialValues: Record<string, string> = {};
  const imageUrls: Record<string, string | null> = {};
  for (const field of section.groups.flatMap((g) => g.fields)) {
    initialValues[field.key] = settings[field.key] ?? "";
    if (field.type === "image") imageUrls[field.key] = publicUrl(settings[field.key]);
  }

  return (
    <>
      <PageHeader
        title={section.title}
        description={section.description}
        icon={section.icon}
        actions={
          <Link href={section.previewHref} target="_blank" rel="noopener noreferrer" className={button.secondary}>
            <Icon name="externalLink" className="h-5 w-5" />
            {admin.settings.seeOnSite}
          </Link>
        }
      />
      {section.slug === "radio" && (
        <Link
          href="/admin/radio-schedule"
          className={`${card} mb-6 flex items-center gap-4 p-4 transition-shadow hover:shadow-md sm:p-5`}
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
            <Icon name="calendar" className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink">{admin.radioSchedule.title}</span>
            <span className="block text-sm text-muted">{admin.radioSchedule.settingsLinkText}</span>
          </span>
          <Icon name="chevronRight" className="h-5 w-5 shrink-0 text-muted" />
        </Link>
      )}
      <SettingsForm key={section.slug} section={section.slug} initialValues={initialValues} imageUrls={imageUrls} />
    </>
  );
}
