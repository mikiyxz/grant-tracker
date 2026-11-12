"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

type Errors = { email?: string; password?: string; form?: string };

export default function LoginPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const newErrors: Errors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setErrors({ form: "Wrong email or password" });
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Log in</h2>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.form && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-base text-red-700">
            {errors.form}
          </p>
        )}
        <Input label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          error={errors.password}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>
      <p className="mt-6 text-base text-gray-600 text-center">
        No account yet?{" "}
        <Link href="/signup" className="text-green-700 font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
