"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button, { buttonClass } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { createChecklistItem } from "@/lib/actions/checklist";
import { createDeadline } from "@/lib/actions/deadlines";
import { createGrant, updateGrant } from "@/lib/actions/grants";
import type { Grant } from "@/lib/types/database";
import {
  createChecklistItemSchema,
  createDeadlineSchema,
  createGrantSchema,
} from "@/lib/validations/grant";

const statusOptions = [
  { value: "applying", label: "Applying" },
  { value: "awarded", label: "Awarded" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

const deadlineFields = createDeadlineSchema.omit({ grant_id: true });
const checklistFields = createChecklistItemSchema.pick({ label: true });

type DeadlineRow = { title: string; due_date: string };
type FieldErrors = Record<string, string>;

// grant is passed in when editing. no grant = creating a new one
export default function GrantForm({ grant }: { grant?: Grant }) {
  const router = useRouter();
  const isEdit = !!grant;

  const [deadlines, setDeadlines] = useState<DeadlineRow[]>([]);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setFormError("");

    // check everything with the same zod schemas the server uses
    const found: FieldErrors = {};

    const values: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value.trim() !== "") values[key] = value;
    }
    const grantCheck = createGrantSchema.safeParse(values);
    if (!grantCheck.success) {
      for (const issue of grantCheck.error.issues) {
        const key = String(issue.path[0]);
        if (!found[key]) found[key] = issue.message;
      }
    }

    deadlines.forEach((row, i) => {
      const check = deadlineFields.safeParse(row);
      if (check.success) return;
      for (const issue of check.error.issues) {
        const key = `deadline_${i}_${String(issue.path[0])}`;
        if (!found[key]) found[key] = issue.message;
      }
    });

    checklist.forEach((label, i) => {
      const check = checklistFields.safeParse({ label });
      if (!check.success) found[`checklist_${i}`] = check.error.issues[0].message;
    });

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);

    if (isEdit) {
      formData.set("id", grant.id);
      const result = await updateGrant(formData);
      if (result.error) {
        setFormError(result.error);
        setSaving(false);
        return;
      }
      router.push(`/grants/${grant.id}`);
      router.refresh();
      return;
    }

    const created = await createGrant(formData);
    if (!created.data) {
      setFormError(created.error ?? "Couldn't save grant");
      setSaving(false);
      return;
    }
    const grantId = created.data.id;

    // the grant is saved at this point. if a deadline or item fails we still
    // go to the grant page, they can add what's missing there
    for (const row of deadlines) {
      const fd = new FormData();
      fd.set("grant_id", grantId);
      fd.set("title", row.title);
      fd.set("due_date", row.due_date);
      await createDeadline(fd);
    }
    for (let i = 0; i < checklist.length; i++) {
      const fd = new FormData();
      fd.set("grant_id", grantId);
      fd.set("label", checklist[i]);
      fd.set("sort_order", String(i));
      await createChecklistItem(fd);
    }

    router.push(`/grants/${grantId}`);
    router.refresh();
  }

  function updateDeadline(i: number, field: keyof DeadlineRow, value: string) {
    setDeadlines(deadlines.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {formError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-base text-red-700">{formError}</p>
      )}

      <Input label="Grant name" name="name" defaultValue={grant?.name} error={errors.name} />
      <Input label="Funder" name="funder" defaultValue={grant?.funder} error={errors.funder} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          label="Amount (CAD)"
          name="amount"
          type="number"
          min="0"
          step="any"
          defaultValue={grant?.amount ?? ""}
          error={errors.amount}
        />
        <Select
          label="Status"
          name="status"
          options={statusOptions}
          defaultValue={grant?.status ?? "applying"}
          error={errors.status}
        />
        <Input
          label="Start date"
          name="start_date"
          type="date"
          defaultValue={grant?.start_date ?? ""}
          error={errors.start_date}
        />
        <Input
          label="End date"
          name="end_date"
          type="date"
          defaultValue={grant?.end_date ?? ""}
          error={errors.end_date}
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-base font-medium text-gray-800 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={grant?.notes ?? ""}
          className={`w-full rounded-md border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-green-600 ${
            errors.notes ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
      </div>

      {!isEdit && (
        <>
          <section>
            <h2 className="text-xl font-semibold mb-3">Deadlines</h2>
            <div className="space-y-4">
              {deadlines.map((row, i) => (
                <div key={i} className="grid gap-3 sm:grid-cols-[1fr_12rem_auto] sm:items-start">
                  <Input
                    label="Title"
                    name={`deadline_title_${i}`}
                    value={row.title}
                    onChange={(e) => updateDeadline(i, "title", e.target.value)}
                    error={errors[`deadline_${i}_title`]}
                  />
                  <Input
                    label="Due date"
                    name={`deadline_date_${i}`}
                    type="date"
                    value={row.due_date}
                    onChange={(e) => updateDeadline(i, "due_date", e.target.value)}
                    error={errors[`deadline_${i}_due_date`]}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="sm:mt-8"
                    onClick={() => setDeadlines(deadlines.filter((_, idx) => idx !== i))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              className="mt-3"
              onClick={() => setDeadlines([...deadlines, { title: "", due_date: "" }])}
            >
              Add deadline
            </Button>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Checklist</h2>
            <div className="space-y-4">
              {checklist.map((label, i) => (
                <div key={i} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                  <Input
                    label="Item"
                    name={`checklist_${i}`}
                    value={label}
                    onChange={(e) =>
                      setChecklist(checklist.map((l, idx) => (idx === i ? e.target.value : l)))
                    }
                    error={errors[`checklist_${i}`]}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="sm:mt-8"
                    onClick={() => setChecklist(checklist.filter((_, idx) => idx !== i))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              className="mt-3"
              onClick={() => setChecklist([...checklist, ""])}
            >
              Add checklist item
            </Button>
          </section>
        </>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save changes" : "Create grant"}
        </Button>
        <Link
          href={isEdit ? `/grants/${grant.id}` : "/dashboard"}
          className={buttonClass("secondary")}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
