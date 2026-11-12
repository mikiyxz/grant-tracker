import { notFound } from "next/navigation";
import GrantForm from "@/components/grants/GrantForm";
import { getGrant } from "@/lib/actions/grants";

export default async function EditGrantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getGrant(id);
  if (!result.data) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit grant</h1>
      <GrantForm grant={result.data} />
    </div>
  );
}
