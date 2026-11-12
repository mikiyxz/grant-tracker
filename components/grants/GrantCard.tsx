import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Grant } from "@/lib/types/database";
import { formatDate, formatMoney } from "@/lib/utils/format";

type Props = {
  grant: Grant;
  nextDeadline?: string;
};

export default function GrantCard({ grant, nextDeadline }: Props) {
  return (
    <Link
      href={`/grants/${grant.id}`}
      className="block rounded-lg border border-gray-200 p-5 hover:border-green-600 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">{grant.name}</h3>
        <StatusBadge status={grant.status} />
      </div>
      <p className="mt-1 text-base text-gray-600">{grant.funder}</p>
      <p className="mt-4 text-lg font-medium text-gray-900">{formatMoney(grant.amount)}</p>
      <p className="mt-1 text-base text-gray-600">
        {nextDeadline ? `Next deadline: ${formatDate(nextDeadline)}` : "Nothing due in the next 30 days"}
      </p>
    </Link>
  );
}
