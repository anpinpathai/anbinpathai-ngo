import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { admin } from "@/content/admin-en";
import type { MemberFormValues } from "@/lib/member-form";
import { requireAdmin } from "@/lib/session";
import { publicUrl } from "@/lib/storage";
import { getMember } from "@/lib/team";
import { TeamForm } from "../TeamForm";

export default async function EditMemberPage(props: PageProps<"/admin/team/[id]">) {
  await requireAdmin();

  const id = Number((await props.params).id);
  if (!Number.isInteger(id)) notFound();

  const member = await getMember(id);
  if (!member) notFound();

  const initialValues: MemberFormValues = {
    id: String(member.id),
    name: member.name,
    roleGroup: member.roleGroup,
    roleTitle: member.roleTitle,
    subtitle: member.subtitle ?? "",
    photoKey: member.photoKey ?? "",
  };

  return (
    <>
      <PageHeader
        title={admin.team.editMember}
        description="Change the details or the photo, then press Save member."
        icon="users"
        back={{ href: "/admin/team", label: admin.team.backToTeam }}
      />
      <TeamForm initialValues={initialValues} photoUrl={publicUrl(member.photoKey)} isEdit />
    </>
  );
}
