import { admin } from "@/content/admin-en";
import { roleGroups } from "@/content/ta-LK";
import type { MemberFormValues } from "@/lib/member-form";
import { requireAdmin } from "@/lib/session";
import { TeamForm } from "../TeamForm";

export default async function NewMemberPage(props: PageProps<"/admin/team/new">) {
  await requireAdmin();

  const sp = await props.searchParams;
  const groupParam = Array.isArray(sp.group) ? sp.group[0] : sp.group;
  const group = roleGroups.find((g) => g.key === groupParam)?.key ?? "member";

  const initialValues: MemberFormValues = {
    id: "",
    name: "",
    roleGroup: group,
    roleTitle: "",
    subtitle: "",
    photoKey: "",
  };

  return (
    <>
      <h1 className="mb-6 text-3xl text-brand">{admin.team.newMember}</h1>
      <TeamForm initialValues={initialValues} photoUrl={null} isEdit={false} />
    </>
  );
}
