import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { TeamCard } from "@/components/TeamCard";
import { pages, roleGroups, t } from "@/content/ta-LK";
import { listMembers } from "@/lib/team";

export const metadata: Metadata = { title: pages.team.title, description: t.siteName };

const leadershipKeys = ["director", "president", "secretary", "treasurer"];

export default async function TeamPage() {
  const members = await listMembers();
  const text = pages.team;

  const inGroup = (key: string) => members.filter((m) => m.roleGroup === key);
  const leadership = roleGroups.filter((g) => leadershipKeys.includes(g.key)).flatMap((g) => inGroup(g.key));
  const regular = roleGroups.filter((g) => !leadershipKeys.includes(g.key));

  return (
    <main>
      <PageHeader title={text.title} crumb={text.title} />

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6">
        {members.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line bg-white/60 p-10 text-center text-muted">
            {text.empty}
          </p>
        )}

        {leadership.length > 0 && (
          <section>
            <h2 className="text-2xl text-brand sm:text-3xl">{text.leadershipTitle}</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {leadership.map((m) => (
                <li key={m.id} className="min-w-0">
                  <TeamCard member={m} large />
                </li>
              ))}
            </ul>
          </section>
        )}

        {regular.map((group) => {
          const list = inGroup(group.key);
          if (list.length === 0) return null;
          return (
            <section key={group.key}>
              <h2 className="text-2xl text-brand sm:text-3xl">{group.heading}</h2>
              <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {list.map((m) => (
                  <li key={m.id} className="min-w-0">
                    <TeamCard member={m} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
