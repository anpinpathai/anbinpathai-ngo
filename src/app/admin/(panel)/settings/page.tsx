import { admin } from "@/content/admin-en";
import { requireAdmin } from "@/lib/session";
import { getSettings, settingFields } from "@/lib/settings";
import { publicUrl } from "@/lib/storage";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  const initialValues: Record<string, string> = {};
  const imageUrls: Record<string, string | null> = {};
  for (const field of settingFields) {
    initialValues[field.key] = settings[field.key] ?? "";
    if (field.type === "image") imageUrls[field.key] = publicUrl(settings[field.key]);
  }

  return (
    <>
      <h1 className="mb-6 text-3xl text-brand">{admin.settings.title}</h1>
      <SettingsForm initialValues={initialValues} imageUrls={imageUrls} />
    </>
  );
}
