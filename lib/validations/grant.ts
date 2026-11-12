import { z } from "zod";
import { stripHtml } from "@/lib/utils/strip-html";

// text that gets html stripped before the length checks run
function text(label: string, max: number) {
  return z
    .string()
    .transform(stripHtml)
    .pipe(
      z
        .string()
        .min(1, `${label} is required`)
        .max(max, `${label} must be ${max} characters or less`)
    );
}

const id = z.uuid("Invalid id");
const date = z.iso.date("Invalid date");
const status = z.enum(["applying", "awarded", "active", "completed"]);

function endAfterStart(grant: { start_date?: string; end_date?: string }) {
  if (!grant.start_date || !grant.end_date) return true;
  return grant.end_date > grant.start_date;
}
const endAfterStartError = {
  message: "End date must be after start date",
  path: ["end_date"],
};

const grantFields = z.object({
  name: text("Name", 200),
  funder: text("Funder", 200),
  amount: z.coerce.number().nonnegative("Amount can't be negative").optional(),
  status,
  start_date: date.optional(),
  end_date: date.optional(),
  notes: z
    .string()
    .transform(stripHtml)
    .pipe(z.string().max(2000, "Notes must be 2000 characters or less"))
    .optional(),
});

export const createGrantSchema = grantFields
  .extend({ status: status.default("applying") })
  .refine(endAfterStart, endAfterStartError);

export const updateGrantSchema = grantFields
  .partial()
  .extend({ id })
  .refine(endAfterStart, endAfterStartError);

export const createDeadlineSchema = z.object({
  grant_id: id,
  title: text("Title", 200),
  due_date: date,
});

export const toggleDeadlineSchema = z.object({
  id,
  is_completed: z.boolean(),
});

export const createChecklistItemSchema = z.object({
  grant_id: id,
  deadline_id: id.optional(),
  label: text("Label", 200),
  sort_order: z.coerce.number().int().default(0),
});

export const toggleChecklistItemSchema = z.object({
  id,
  is_checked: z.boolean(),
});

export const idSchema = id;
