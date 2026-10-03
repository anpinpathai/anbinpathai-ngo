import Image from "next/image";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/admin/Icon";
import { Notice } from "@/components/admin/Notice";
import { PageHeader } from "@/components/admin/PageHeader";
import { button, card } from "@/components/admin/ui";
import { admin, roleGroupEnglish } from "@/content/admin-en";
import { roleGroups } from "@/content/ta-LK";
import { initialOf } from "@/lib/names";
import { requireAdmin } from "@/lib/session";
import { publicUrl } from "@/lib/storage";
import { listMembers } from "@/lib/team";
import { deleteMemberAction, moveMemberAction } from "./actions";

const notices: Record<string, string> = {
  created: admin.common.noticeCreated,
  deleted: admin.common.noticeDeleted,
};

function MoveButton({ id, direction, disabled }: { id: number; direction: "up" | "down"; disabled: boolean }) {
  const label = direction === "up" ? admin.team.moveEarlier : admin.team.moveLater;
  return (
    <form action={moveMemberAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button type="submit" disabled={disabled} aria-label={label} title={label} className={button.icon}>
        <Icon name={direction === "up" ? "arrowLeft" : "arrowRight"} className="h-4 w-4" />
      </button>
    </form>
  );
}

export default async function TeamPage(props: PageProps<"/admin/team">) {
  await requireAdmin();

  const sp = await props.searchParams;
  const noticeKey = Array.isArray(sp.notice) ? sp.notice[0] : sp.notice;
  const notice = notices[noticeKey ?? ""];

  const members = await listMembers();

  return (
    <>
      <PageHeader
        title={admin.team.title}
        description={admin.team.subtitle}
        icon="users"
        actions={
          <Link href="/admin/team/new" className={button.gold}>
            <Icon name="plus" className="h-5 w-5" />
            {admin.team.newMember}
          </Link>
        }
      />

      {notice && (
        <div className="mb-5">
          <Notice>{notice}</Notice>
        </div>
      )}

      <div className="space-y-6">
        {roleGroups.map((group) => {
          const list = members.filter((m) => m.roleGroup === group.key);
          return (
            <section key={group.key} className={`${card} p-5 sm:p-6`} aria-labelledby={`group-${group.key}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h2 id={`group-${group.key}`} className="text-xl font-bold text-brand-dark">
                    {roleGroupEnglish[group.key]}
                  </h2>
                  <span lang="ta" className="text-sm text-muted">
                    {group.heading}
                  </span>
                  <span className="rounded-full bg-panel px-2.5 py-0.5 text-sm font-bold text-muted">
                    {admin.team.count(list.length)}
                  </span>
                </div>
                <Link href={`/admin/team/new?group=${group.key}`} className={button.small}>
                  <Icon name="plus" className="h-4 w-4" />
                  {admin.team.newMember}
                </Link>
              </div>

              {list.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-line bg-panel/60 px-4 py-6 text-center text-muted">
                  {admin.team.empty}
                </p>
              ) : (
                <ul className="mt-5 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">
                  {list.map((m, index) => {
                    const photo = publicUrl(m.photoKey);
                    return (
                      <li key={m.id} className="flex flex-col items-center rounded-2xl border border-line/80 bg-panel/40 p-4 text-center">
                        {photo ? (
                          <Image
                            src={photo}
                            alt=""
                            width={192}
                            height={192}
                            unoptimized
                            className="h-24 w-24 rounded-full border-2 border-white object-cover shadow"
                          />
                        ) : (
                          <span
                            aria-label={admin.team.noPhoto}
                            title={admin.team.noPhoto}
                            className="grid h-24 w-24 place-items-center rounded-full bg-sand text-3xl font-bold text-muted"
                          >
                            {initialOf(m.name)}
                          </span>
                        )}

                        <div className="mt-3 min-w-0" lang="ta">
                          <p className="font-semibold leading-snug text-ink">{m.name}</p>
                          <p className="text-sm leading-snug text-muted">
                            {m.roleTitle}
                            {m.subtitle ? ` · ${m.subtitle}` : ""}
                          </p>
                        </div>

                        <div className="mt-auto flex flex-wrap items-center justify-center gap-2 pt-4">
                          <MoveButton id={m.id} direction="up" disabled={index === 0} />
                          <MoveButton id={m.id} direction="down" disabled={index === list.length - 1} />
                          <Link href={`/admin/team/${m.id}`} className={button.small}>
                            <Icon name="edit" className="h-4 w-4" />
                            {admin.common.edit}
                          </Link>
                          <DeleteButton
                            action={deleteMemberAction}
                            id={m.id}
                            label={admin.common.delete}
                            title={admin.team.deleteTitle}
                            confirmMessage={admin.team.confirmDelete}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
