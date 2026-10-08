import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/admin/Icon";
import { NoticeToast } from "@/components/admin/NoticeToast";
import { PageHeader } from "@/components/admin/PageHeader";
import { button, card } from "@/components/admin/ui";
import { admin } from "@/content/admin-en";
import { getRadioConfig } from "@/lib/radio";
import { listForAdmin, type AdminProgramme } from "@/lib/radio-schedule";
import { scheduleLineTa } from "@/lib/radio-schedule-format";
import { requireAdmin } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { deleteProgrammeAction } from "./actions";

const notices: Record<string, string> = {
  created: admin.common.noticeCreated,
  deleted: admin.common.noticeDeleted,
};

const badgeClass = {
  weekly: "bg-brand/10 text-brand",
  upcoming: "bg-green-100 text-green-800",
  past: "bg-sand text-muted",
} as const;

function ProgrammeCard({ p }: { p: AdminProgramme }) {
  const text = admin.radioSchedule;
  const past = p.status === "past";
  return (
    <li className={`${card} flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:px-5 ${past ? "bg-panel/60" : ""}`}>
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
          past ? "bg-sand text-muted" : "bg-brand/10 text-brand"
        }`}
      >
        <Icon name={p.kind === "weekly" ? "rotateRight" : "calendar"} className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1 basis-56" lang="ta">
        <p className={`font-semibold leading-snug! [overflow-wrap:anywhere] ${past ? "text-muted" : "text-ink"}`}>{p.title}</p>
        <p className="mt-0.5 text-sm leading-snug! text-muted [overflow-wrap:anywhere]">{scheduleLineTa(p)}</p>
      </div>

      <span className={`rounded-full px-3 py-1 text-sm font-bold ${badgeClass[p.status]}`}>{text.badge[p.status]}</span>

      <div className="flex items-center gap-2">
        <Link href={`/admin/radio-schedule/${p.id}`} className={button.small}>
          <Icon name="edit" className="h-4 w-4" />
          {admin.common.edit}
        </Link>
        <DeleteButton
          action={deleteProgrammeAction}
          id={p.id}
          label={admin.common.delete}
          title={text.deleteTitle}
          confirmMessage={text.confirmDelete}
        />
      </div>
    </li>
  );
}

function Group({ title, hint, list }: { title: string; hint?: string; list: AdminProgramme[] }) {
  if (list.length === 0) return null;
  return (
    <section aria-label={title}>
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3">
        <h2 className="text-lg font-bold text-brand-dark">{title}</h2>
        <span className="rounded-full bg-panel px-2.5 py-0.5 text-sm font-bold text-muted">
          {admin.radioSchedule.count(list.length)}
        </span>
        {hint && <span className="text-sm text-muted">{hint}</span>}
      </div>
      <ul className="space-y-3">
        {list.map((p) => (
          <ProgrammeCard key={p.id} p={p} />
        ))}
      </ul>
    </section>
  );
}

export default async function RadioSchedulePage(props: PageProps<"/admin/radio-schedule">) {
  await requireAdmin();

  const sp = await props.searchParams;
  const noticeKey = Array.isArray(sp.notice) ? sp.notice[0] : sp.notice;
  const notice = notices[noticeKey ?? ""];

  const [{ weekly, once, past }, settings] = await Promise.all([listForAdmin(), getSettings()]);
  const text = admin.radioSchedule;
  const total = weekly.length + once.length + past.length;
  const radioOn = Boolean(getRadioConfig(settings));

  return (
    <>
      <PageHeader
        title={text.title}
        description={text.subtitle}
        icon="calendar"
        actions={
          <Link href="/admin/radio-schedule/new" className={button.gold}>
            <Icon name="plus" className="h-5 w-5" />
            {text.newProgramme}
          </Link>
        }
      />

      {notice && <NoticeToast message={notice} />}

      {!radioOn && (
        <p className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          <Icon name="info" className="mt-0.5 h-5 w-5 shrink-0" />
          <span>
            {text.radioOff}{" "}
            <Link href="/admin/settings/radio" className="font-semibold underline underline-offset-2">
              {text.radioSettings}
            </Link>
          </span>
        </p>
      )}

      {total === 0 ? (
        <div className={`${card} flex flex-col items-center px-6 py-14 text-center`}>
          <span className="grid h-16 w-16 place-items-center rounded-full bg-brand/10 text-brand">
            <Icon name="calendar" className="h-8 w-8" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-brand-dark">{text.emptyTitle}</h2>
          <p className="mt-1 max-w-md text-muted">{text.emptyText}</p>
          <Link href="/admin/radio-schedule/new" className={`${button.gold} mt-6`}>
            <Icon name="plus" className="h-5 w-5" />
            {text.newProgramme}
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <Group title={text.groups.weekly} list={weekly} />
          <Group title={text.groups.once} list={once} />
          <Group title={text.groups.past} hint={text.pastHint} list={past} />
        </div>
      )}
    </>
  );
}
