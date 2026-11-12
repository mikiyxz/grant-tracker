import Link from "next/link";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // middleware already redirects, this is a second check
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200">
        <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-green-700">
            Grant Tracker
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/settings" className="text-base text-gray-600 hover:text-gray-900">
              Settings
            </Link>
            <form action={signOut}>
              <Button type="submit" variant="secondary">
                Sign out
              </Button>
            </form>
          </div>
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
