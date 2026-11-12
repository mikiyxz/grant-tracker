import Link from "next/link";
import type { UpcomingDeadline } from "@/lib/types/database";
import { formatDate } from "@/lib/utils/format";

export default function UpcomingDeadlines({ deadlines }: { deadlines: UpcomingDeadline[] }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Due in the next 30 days</h2>
      {deadlines.length === 0 ? (
        <p className="text-base text-gray-600">Nothing due in the next 30 days.</p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
          {deadlines.map((d) => (
            <li key={d.id}>
              <Link
                href={`/grants/${d.grant_id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50"
              >
                <div>
                  <p className="text-base font-medium text-gray-900">{d.title}</p>
                  <p className="text-base text-gray-600">{d.grants.name}</p>
                </div>
                <p className="text-base text-gray-800 whitespace-nowrap">{formatDate(d.due_date)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
