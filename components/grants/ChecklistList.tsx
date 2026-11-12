"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createChecklistItem, toggleChecklistItem } from "@/lib/actions/checklist";
import type { ChecklistItem } from "@/lib/types/database";
import { createChecklistItemSchema } from "@/lib/validations/grant";

export default function ChecklistList({
  grantId,
  items,
}: {
  grantId: string;
  items: ChecklistItem[];
}) {
  const router = useRouter();
  const [labelError, setLabelError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);

  async function handleToggle(item: ChecklistItem) {
    const result = await toggleChecklistItem(item.id, !item.is_checked);
    if (result.error) setFormError(result.error);
    router.refresh();
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setFormError("");

    const check = createChecklistItemSchema.safeParse({
      grant_id: grantId,
      label: formData.get("label"),
    });
    if (!check.success) {
      setLabelError(check.error.issues[0].message);
      return;
    }
    setLabelError("");

    formData.set("grant_id", grantId);
    // new items go to the end of the list
    formData.set("sort_order", String(sorted.length));

    setSaving(true);
    const result = await createChecklistItem(formData);
    setSaving(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    form.reset();
    router.refresh();
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Checklist</h2>
      {formError && <p className="mb-3 text-base text-red-700">{formError}</p>}

      {sorted.length === 0 ? (
        <p className="text-base text-gray-600 mb-4">No checklist items yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 mb-4">
          {sorted.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3">
              <input
                type="checkbox"
                id={`item-${item.id}`}
                checked={item.is_checked}
                onChange={() => handleToggle(item)}
                className="h-5 w-5 accent-green-600"
              />
              <label
                htmlFor={`item-${item.id}`}
                className={`flex-1 text-base ${item.is_checked ? "text-gray-500 line-through" : "text-gray-900"}`}
              >
                {item.label}
              </label>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start" noValidate>
        <Input label="New item" name="label" error={labelError} />
        <Button type="submit" variant="secondary" className="sm:mt-8" disabled={saving}>
          Add item
        </Button>
      </form>
    </section>
  );
}
