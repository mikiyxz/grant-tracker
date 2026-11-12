import Link from "next/link";
import GrantCard from "@/components/grants/GrantCard";
import UpcomingDeadlines from "@/components/dashboard/UpcomingDeadlines";
import { buttonClass } from "@/components/ui/Button";
import { getUpcomingDeadlines } from "@/lib/actions/deadlines";
import { getGrants } from "@/lib/actions/grants";

export default async function DashboardPage() {
  const [grantsResult, deadlinesResult] = await Promise.all([
    getGrants(),
    getUpcomingDeadlines(),
  ]);

  if (grantsResult.error) {
    return <p className="text-base text-red-700">{grantsResult.error}</p>;
  }

  const grants = grantsResult.data ?? [];
  const deadlines = deadlinesResult.data ?? [];

  if (grants.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-3">No grants yet</h1>
        <p className="text-lg text-gray-600 mb-6">
          Add a grant and its deadlines and and the due dates stay in one place.
        </p>
        <Link href="/grants/new" className={buttonClass("primary")}>
          Add Your First Grant
        </Link>
      </div>
    );
  }

  // deadlines come back sorted by date, so the first match is the next one
  function nextDeadlineFor(grantId: string) {
    return deadlines.find((d) => d.grant_id === grantId)?.due_date;
  }

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Your grants</h1>
          <Link href="/grants/new" className={buttonClass("primary")}>
            Add Grant
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grants.map((grant) => (
            <GrantCard key={grant.id} grant={grant} nextDeadline={nextDeadlineFor(grant.id)} />
          ))}
        </div>
      </section>

      <UpcomingDeadlines deadlines={deadlines} />
    </div>
  );
}
