"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createDeadline, toggleDeadline } from "@/lib/actions/deadlines";
import type { Deadline } from "@/lib/types/database";
import { formatDate } from "@/lib/utils/format";
import { createDeadlineSchema } from "@/lib/validations/grant";

export default function DeadlineList({
  grantId,
  deadlines,
}: {
  grantId: string;
  deadlines: Deadline[];
}) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const sorted = [...deadlines].sort((a, b) => a.due_date.localeCompare(b.due_date));

  async function handleToggle(d: Deadline) {
    const result = await toggleDeadline(d.id, !d.is_completed);
    if (result.error) setFormError(result.error);
    router.refresh();
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("grant_id", grantId);
    setFormError("");

    const check = createDeadlineSchema.safeParse({
      grant_id: grantId,
      title: formData.get("title"),
      due_date: formData.get("due_date"),
    });
    if (!check.success) {
      const found: Record<string, string> = {};
      for (const issue of check.error.issues) {
        const key = String(issue.path[0]);
        if (!found[key]) found[key] = issue.message;
      }
      setErrors(found);
      return;
    }
    setErrors({});

    setSaving(true);
    const result = await createDeadline(formData);
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
      <h2 className="text-2xl font-semibold mb-4">Deadlines</h2>
      {formError && <p className="mb-3 text-base text-red-700">{formError}</p>}

      {sorted.length === 0 ? (
        <p className="text-base text-gray-600 mb-4">No deadlines yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 mb-4">
          {sorted.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-4 py-3">
              <input
                type="checkbox"
                id={`deadline-${d.id}`}
                checked={d.is_completed}
                onChange={() => handleToggle(d)}
                className="h-5 w-5 accent-green-600"
              />
              <label
                htmlFor={`deadline-${d.id}`}
                className={`flex-1 text-base ${d.is_completed ? "text-gray-500 line-through" : "text-gray-900"}`}
              >
                {d.title}
              </label>
              <span className="text-base text-gray-600 whitespace-nowrap">
                {formatDate(d.due_date)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleAdd}
        className="grid gap-3 sm:grid-cols-[1fr_12rem_auto] sm:items-start"
        noValidate
      >
        <Input label="Title" name="title" error={errors.title} />
        <Input label="Due date" name="due_date" type="date" error={errors.due_date} />
        <Button type="submit" variant="secondary" className="sm:mt-8" disabled={saving}>
          Add deadline
        </Button>
      </form>
    </section>
  );
}
