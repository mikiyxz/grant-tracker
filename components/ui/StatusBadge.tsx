import type { GrantStatus } from "@/lib/types/database";

const styles: Record<GrantStatus, string> = {
  applying: "bg-yellow-100 text-yellow-800",
  awarded: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-700",
};

export default function StatusBadge({ status }: { status: GrantStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}
