import Image from "next/image";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { admin, roleGroupEnglish } from "@/content/admin-en";
import { roleGroups } from "@/content/ta-LK";
import { requireAdmin } from "@/lib/session";
import { publicUrl } from "@/lib/storage";
import { listMembers } from "@/lib/team";
import { deleteMemberAction, moveMemberAction } from "./actions";

const notices: Record<string, string> = {
  created: admin.common.noticeCreated,
  deleted: admin.common.noticeDeleted,
};

const graphemes = new Intl.Segmenter("ta", { granularity: "grapheme" });

function initialOf(name: string) {
  const stripped = name.replace(/^(?:திருமதி|திரு|செல்வி|செல்வன்)[.\s]+/, "").trim();
  const [first] = graphemes.segment(stripped || name);
  return first?.segment ?? "?";
}

function MoveButton({ id, direction, disabled }: { id: number; direction: "up" | "down"; disabled: boolean }) {
  return (
    <form action={moveMemberAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button
        type="submit"
        disabled={disabled}
        aria-label={direction === "up" ? admin.team.moveUp : admin.team.moveDown}
        title={direction === "up" ? admin.team.moveUp : admin.team.moveDown}
        className="grid h-8 w-8 place-items-center rounded-md border border-line font-bold text-brand hover:bg-sand disabled:opacity-30"
      >
        {direction === "up" ? "↑" : "↓"}
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl text-brand">{admin.team.title}</h1>
        <Link
          href="/admin/team/new"
          className="rounded-full bg-brand px-6 py-2.5 font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {admin.team.newMember}
        </Link>
      </div>

      {notice && (
        <p role="status" className="mt-5 rounded-lg bg-green-50 px-4 py-2 font-semibold text-cat-green">
          {notice}
        </p>
      )}

      <div className="mt-8 space-y-8">
        {roleGroups.map((group) => {
          const list = members.filter((m) => m.roleGroup === group.key);
          return (
            <section key={group.key} className="rounded-2xl border border-line bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl text-brand">
                  {roleGroupEnglish[group.key]}{" "}
                  <span lang="ta" className="text-base font-normal text-muted">
                    ({group.heading})
                  </span>
                </h2>
                <Link
                  href={`/admin/team/new?group=${group.key}`}
                  className="text-sm font-semibold text-brand underline-offset-4 hover:underline"
                >
                  + {admin.team.newMember}
                </Link>
              </div>

              {list.length === 0 ? (
                <p className="mt-3 text-muted">{admin.team.empty}</p>
              ) : (
                <ul className="mt-4 divide-y divide-line">
                  {list.map((m, index) => {
                    const photo = publicUrl(m.photoKey);
                    return (
                      <li key={m.id} className="flex flex-wrap items-center gap-4 py-3">
                        {photo ? (
                          <Image
                            src={photo}
                            alt=""
                            width={96}
                            height={96}
                            unoptimized
                            className="h-12 w-12 shrink-0 rounded-full border border-line object-cover"
                          />
                        ) : (
                          <span
                            aria-label={admin.team.noPhoto}
                            title={admin.team.noPhoto}
                            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sand text-lg font-semibold text-muted"
                          >
                            {initialOf(m.name)}
                          </span>
                        )}

                        <div className="min-w-0 flex-1" lang="ta">
                          <p className="font-semibold">{m.name}</p>
                          <p className="text-sm text-muted">
                            {m.roleTitle}
                            {m.subtitle ? ` · ${m.subtitle}` : ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <MoveButton id={m.id} direction="up" disabled={index === 0} />
                          <MoveButton id={m.id} direction="down" disabled={index === list.length - 1} />
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <Link
                            href={`/admin/team/${m.id}`}
                            className="font-semibold text-brand underline-offset-4 hover:underline"
                          >
                            {admin.common.edit}
                          </Link>
                          <DeleteButton
                            action={deleteMemberAction}
                            id={m.id}
                            label={admin.common.delete}
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
