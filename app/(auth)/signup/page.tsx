"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

type Errors = { full_name?: string; email?: string; password?: string; form?: string };

export default function SignupPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const full_name = String(form.get("full_name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const newErrors: Errors = {};
    if (!full_name) newErrors.full_name = "Name is required";
    if (!email) newErrors.email = "Email is required";
    if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      setErrors({ form: error.message });
      return;
    }

    // no session means email confirmation is turned on
    if (!data.session) {
      setCheckEmail(true);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (checkEmail) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-3">Check your email</h2>
        <p className="text-base text-gray-600">
          We sent a confirmation link. Click it to finish signing up.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Create an account</h2>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.form && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-base text-red-700">
            {errors.form}
          </p>
        )}
        <Input label="Full name" name="full_name" autoComplete="name" error={errors.full_name} />
        <Input label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          error={errors.password}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>
      <p className="mt-6 text-base text-gray-600 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-green-700 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
