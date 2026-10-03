import { notFound } from "next/navigation";
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
      <h1 className="mb-6 text-3xl text-brand">{admin.team.editMember}</h1>
      <TeamForm initialValues={initialValues} photoUrl={publicUrl(member.photoKey)} isEdit />
    </>
  );
}
