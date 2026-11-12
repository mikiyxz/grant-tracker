import GrantForm from "@/components/grants/GrantForm";

export default function NewGrantPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Add a grant</h1>
      <GrantForm />
    </div>
  );
}
