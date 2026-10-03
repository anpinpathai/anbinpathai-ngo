import { admin } from "@/content/admin-en";
import { roleGroups } from "@/content/ta-LK";
import { ROLE_GROUPS, type RoleGroup } from "@/db/schema";
import type { MemberInput } from "@/lib/team";
import { isValidKey } from "@/lib/storage";

export type MemberFormValues = {
  id: string;
  name: string;
  roleGroup: string;
  roleTitle: string;
  subtitle: string;
  photoKey: string;
};

export type MemberFormErrors = Partial<Record<keyof MemberFormValues, string>>;

export function readMemberForm(formData: FormData): MemberFormValues {
  const text = (name: string) => String(formData.get(name) ?? "");
  return {
    id: text("id").trim(),
    name: text("name"),
    roleGroup: text("roleGroup"),
    roleTitle: text("roleTitle"),
    subtitle: text("subtitle"),
    photoKey: text("photoKey"),
  };
}

export function validateMember(raw: MemberFormValues) {
  const errors: MemberFormErrors = {};
  const common = admin.common;

  const name = raw.name.trim();
  if (!name) errors.name = admin.team.errors.name;
  else if (name.length > 120) errors.name = common.tooLong(120);

  const group = ROLE_GROUPS.find((g) => g === raw.roleGroup);
  if (!group) errors.roleGroup = admin.team.errors.group;

  let roleTitle = raw.roleTitle.trim();
  if (!roleTitle && group) roleTitle = roleGroups.find((g) => g.key === group)?.title ?? "";
  if (!roleTitle) errors.roleTitle = admin.team.errors.roleTitle;
  else if (roleTitle.length > 60) errors.roleTitle = common.tooLong(60);

  const subtitle = raw.subtitle.trim();
  if (subtitle.length > 100) errors.subtitle = common.tooLong(100);

  const photoKey = raw.photoKey.trim();
  if (photoKey && !isValidKey(photoKey)) errors.photoKey = admin.team.errors.photo;

  const values: MemberFormValues = { id: raw.id, name, roleGroup: raw.roleGroup, roleTitle, subtitle, photoKey };
  if (Object.keys(errors).length > 0 || !group) return { values, errors, input: null };

  const input: MemberInput = {
    name,
    roleTitle,
    roleGroup: group as RoleGroup,
    subtitle: subtitle || null,
    photoKey: photoKey || null,
  };
  return { values, errors, input };
}
