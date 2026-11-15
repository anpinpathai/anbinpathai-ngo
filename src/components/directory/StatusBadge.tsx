import type { DirectoryStatus } from "@/db/schema";
import { STATUS_LABEL_EN } from "@/lib/directory/config";

const look: Record<DirectoryStatus, string> = {
  pending: "bg-gold/25 text-amber-900",
  approved: "bg-green-100 text-green-800",
  update_needed: "bg-sky-100 text-sky-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-panel text-muted",
};

export function StatusBadge({ status }: { status: DirectoryStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${look[status]}`}>
      {STATUS_LABEL_EN[status]}
    </span>
  );
}
