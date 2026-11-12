import Link from "next/link";
import { notFound } from "next/navigation";
import ChecklistList from "@/components/grants/ChecklistList";
import DeadlineList from "@/components/grants/DeadlineList";
import DeleteGrantButton from "@/components/grants/DeleteGrantButton";
import { buttonClass } from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { getGrant } from "@/lib/actions/grants";
import { formatDate, formatMoney } from "@/lib/utils/format";

export default async function GrantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getGrant(id);
  if (!result.data) notFound();

  const grant = result.data;

  return (
    <div className="space-y-10">
      <div>
        <Link href="/dashboard" className="text-base text-green-700 hover:underline">
          &larr; Back to dashboard
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{grant.name}</h1>
            <p className="mt-1 text-lg text-gray-600">{grant.funder}</p>
          </div>
          <div className="flex items-start gap-3">
            <Link href={`/grants/${grant.id}/edit`} className={buttonClass("secondary")}>
              Edit
            </Link>
            <DeleteGrantButton grantId={grant.id} />
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm text-gray-500">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={grant.status} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Amount</dt>
            <dd className="mt-1 text-base text-gray-900">{formatMoney(grant.amount)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Start date</dt>
            <dd className="mt-1 text-base text-gray-900">{formatDate(grant.start_date) || "Not set"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">End date</dt>
            <dd className="mt-1 text-base text-gray-900">{formatDate(grant.end_date) || "Not set"}</dd>
          </div>
        </dl>

        {grant.notes && (
          <div className="mt-6">
            <h2 className="text-sm text-gray-500">Notes</h2>
            <p className="mt-1 text-base text-gray-900 whitespace-pre-wrap">{grant.notes}</p>
          </div>
        )}
      </div>

      <DeadlineList grantId={grant.id} deadlines={grant.deadlines} />
      <ChecklistList grantId={grant.id} items={grant.checklist_items} />
    </div>
  );
}
