"use server";

import type { Profile } from "@/lib/types/database";
import { fail, ok, withUser } from "./helpers";
import type { ActionResult } from "./helpers";

export async function getProfile(): Promise<ActionResult<Profile>> {
  return withUser(async (supabase, user) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) return fail("Couldn't load settings");
    if (!data) return fail("Profile not found");
    return ok(data as Profile);
  });
}

export async function setEmailReminders(
  enabled: boolean
): Promise<ActionResult<Profile>> {
  return withUser(async (supabase, user) => {
    if (typeof enabled !== "boolean") return fail("Invalid value");

    const { data, error } = await supabase
      .from("profiles")
      .update({ email_reminders_enabled: enabled })
      .eq("id", user.id)
      .select()
      .maybeSingle();

    if (error) return fail("Couldn't save settings");
    if (!data) return fail("Profile not found");
    return ok(data as Profile);
  });
}
