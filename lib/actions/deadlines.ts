"use server";

import type { Deadline, UpcomingDeadline } from "@/lib/types/database";
import {
  createDeadlineSchema,
  idSchema,
  toggleDeadlineSchema,
} from "@/lib/validations/grant";
import { fail, formDataToObject, ok, withUser } from "./helpers";
import type { ActionResult } from "./helpers";

export async function createDeadline(
  formData: FormData
): Promise<ActionResult<Deadline>> {
  return withUser(async (supabase) => {
    const parsed = createDeadlineSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return fail(parsed.error.issues[0].message);

    // RLS rejects the insert if the grant isn't the user's
    const { data, error } = await supabase
      .from("deadlines")
      .insert(parsed.data)
      .select()
      .single();

    if (error) return fail("Couldn't save deadline");
    return ok(data as Deadline);
  });
}

export async function toggleDeadline(
  id: string,
  is_completed: boolean
): Promise<ActionResult<Deadline>> {
  return withUser(async (supabase) => {
    const parsed = toggleDeadlineSchema.safeParse({ id, is_completed });
    if (!parsed.success) return fail(parsed.error.issues[0].message);

    const { data, error } = await supabase
      .from("deadlines")
      .update({ is_completed: parsed.data.is_completed })
      .eq("id", parsed.data.id)
      .select()
      .maybeSingle();

    if (error) return fail("Couldn't update deadline");
    if (!data) return fail("Deadline not found");
    return ok(data as Deadline);
  });
}

export async function deleteDeadline(
  id: string
): Promise<ActionResult<{ id: string }>> {
  return withUser(async (supabase) => {
    const parsed = idSchema.safeParse(id);
    if (!parsed.success) return fail("Invalid deadline id");

    const { data, error } = await supabase
      .from("deadlines")
      .delete()
      .eq("id", parsed.data)
      .select("id")
      .maybeSingle();

    if (error) return fail("Couldn't delete deadline");
    if (!data) return fail("Deadline not found");
    return ok({ id: parsed.data });
  });
}

// "YYYY-MM-DD" for a given date, using Toronto time so a deadline due
// today doesn't drop off in the evening when the server is on UTC
function toDateString(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
}

export async function getUpcomingDeadlines(): Promise<
  ActionResult<UpcomingDeadline[]>
> {
  return withUser(async (supabase, user) => {
    const today = new Date();
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("deadlines")
      .select("*, grants!inner(name)")
      .eq("is_completed", false)
      .eq("grants.user_id", user.id)
      .is("grants.deleted_at", null)
      .gte("due_date", toDateString(today))
      .lte("due_date", toDateString(in30Days))
      .order("due_date", { ascending: true });

    if (error) return fail("Couldn't load deadlines");
    return ok(data as UpcomingDeadline[]);
  });
}
