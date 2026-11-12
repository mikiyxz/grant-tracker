import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export function ok<T>(data: T): ActionResult<T> {
  return { data, error: null };
}

export function fail<T>(error: string): ActionResult<T> {
  return { data: null, error };
}

// runs an action as the logged in user. no user = error, and anything
// thrown inside gets turned into an error so actions never throw.
export async function withUser<T>(
  run: (supabase: SupabaseServerClient, user: User) => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return fail("You need to be logged in");
    const user = data.user;

    // the signup trigger normally makes the profile. if it didn't fire for
    // some reason, make it here so grants don't fail on the user_id foreign key
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email || "New user",
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
    if (profileError) {
      console.error("profile check failed for", user.id, profileError);
      return fail("Something went wrong");
    }

    return await run(supabase, user);
  } catch {
    return fail("Something went wrong");
  }
}

// FormData -> plain object. empty fields are left out so optional
// zod fields see them as missing instead of "".
export function formDataToObject(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && value.trim() !== "") {
      result[key] = value;
    }
  }
  return result;
}
