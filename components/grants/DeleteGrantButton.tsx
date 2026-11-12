"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { deleteGrant } from "@/lib/actions/grants";

export default function DeleteGrantButton({ grantId }: { grantId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this grant?")) return;
    setDeleting(true);
    const result = await deleteGrant(grantId);
    if (result.error) {
      setError(result.error);
      setDeleting(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <Button variant="danger" onClick={handleDelete} disabled={deleting}>
        {deleting ? "Deleting..." : "Delete"}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
