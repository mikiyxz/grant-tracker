"use server";

import type { Grant, GrantWithDetails } from "@/lib/types/database";
import {
  createGrantSchema,
  idSchema,
  updateGrantSchema,
} from "@/lib/validations/grant";
import { fail, formDataToObject, ok, withUser } from "./helpers";
import type { ActionResult } from "./helpers";

export async function getGrants(): Promise<ActionResult<Grant[]>> {
  return withUser(async (supabase, user) => {
    const { data, error } = await supabase
      .from("grants")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getGrants failed for", user.id, error);
      return fail("Couldn't load grants");
    }
    return ok(data as Grant[]);
  });
}

export async function getGrant(
  id: string
): Promise<ActionResult<GrantWithDetails>> {
  return withUser(async (supabase, user) => {
    const parsed = idSchema.safeParse(id);
    if (!parsed.success) return fail("Invalid grant id");

    const { data, error } = await supabase
      .from("grants")
      .select("*, deadlines(*), checklist_items(*)")
      .eq("id", parsed.data)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) return fail("Couldn't load grant");
    if (!data) return fail("Grant not found");
    return ok(data as GrantWithDetails);
  });
}

export async function createGrant(
  formData: FormData
): Promise<ActionResult<Grant>> {
  return withUser(async (supabase, user) => {
    const parsed = createGrantSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return fail(parsed.error.issues[0].message);

    const { data, error } = await supabase
      .from("grants")
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single();

    if (error) return fail("Couldn't save grant");
    return ok(data as Grant);
  });
}

export async function updateGrant(
  formData: FormData
): Promise<ActionResult<Grant>> {
  return withUser(async (supabase, user) => {
    const parsed = updateGrantSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return fail(parsed.error.issues[0].message);

    const { id, ...changes } = parsed.data;

    const { data, error } = await supabase
      .from("grants")
      .update(changes)
      .eq("id", id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .select()
      .maybeSingle();

    if (error) return fail("Couldn't update grant");
    if (!data) return fail("Grant not found");
    return ok(data as Grant);
  });
}

// soft delete, the row stays in the db with deleted_at set
export async function deleteGrant(
  id: string
): Promise<ActionResult<{ id: string }>> {
  return withUser(async (supabase, user) => {
    const parsed = idSchema.safeParse(id);
    if (!parsed.success) return fail("Invalid grant id");

    const { data, error } = await supabase
      .from("grants")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", parsed.data)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();

    if (error) return fail("Couldn't delete grant");
    if (!data) return fail("Grant not found");
    return ok({ id: parsed.data });
  });
}
