"use server";

import type { ChecklistItem } from "@/lib/types/database";
import {
  createChecklistItemSchema,
  idSchema,
  toggleChecklistItemSchema,
} from "@/lib/validations/grant";
import { fail, formDataToObject, ok, withUser } from "./helpers";
import type { ActionResult } from "./helpers";

export async function createChecklistItem(
  formData: FormData
): Promise<ActionResult<ChecklistItem>> {
  return withUser(async (supabase) => {
    const parsed = createChecklistItemSchema.safeParse(
      formDataToObject(formData)
    );
    if (!parsed.success) return fail(parsed.error.issues[0].message);

    // RLS doesn't check that the deadline belongs to the same grant, so do it here
    if (parsed.data.deadline_id) {
      const { data: deadline } = await supabase
        .from("deadlines")
        .select("id")
        .eq("id", parsed.data.deadline_id)
        .eq("grant_id", parsed.data.grant_id)
        .maybeSingle();

      if (!deadline) return fail("Deadline not found on this grant");
    }

    const { data, error } = await supabase
      .from("checklist_items")
      .insert(parsed.data)
      .select()
      .single();

    if (error) return fail("Couldn't save checklist item");
    return ok(data as ChecklistItem);
  });
}

export async function toggleChecklistItem(
  id: string,
  is_checked: boolean
): Promise<ActionResult<ChecklistItem>> {
  return withUser(async (supabase) => {
    const parsed = toggleChecklistItemSchema.safeParse({ id, is_checked });
    if (!parsed.success) return fail(parsed.error.issues[0].message);

    const { data, error } = await supabase
      .from("checklist_items")
      .update({ is_checked: parsed.data.is_checked })
      .eq("id", parsed.data.id)
      .select()
      .maybeSingle();

    if (error) return fail("Couldn't update checklist item");
    if (!data) return fail("Checklist item not found");
    return ok(data as ChecklistItem);
  });
}

export async function deleteChecklistItem(
  id: string
): Promise<ActionResult<{ id: string }>> {
  return withUser(async (supabase) => {
    const parsed = idSchema.safeParse(id);
    if (!parsed.success) return fail("Invalid checklist item id");

    const { data, error } = await supabase
      .from("checklist_items")
      .delete()
      .eq("id", parsed.data)
      .select("id")
      .maybeSingle();

    if (error) return fail("Couldn't delete checklist item");
    if (!data) return fail("Checklist item not found");
    return ok({ id: parsed.data });
  });
}
