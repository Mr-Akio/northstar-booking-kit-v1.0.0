"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge, Card } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const registerSchema = loginSchema.extend({
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
  confirm_password: z.string().min(8, "Please confirm your password."),
}).refine((values) => values.password === values.confirm_password, {
  message: "Passwords must match.",
  path: ["confirm_password"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setServerError(null);
      await login(values.email, values.password);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        return;
      }
      setServerError("We could not sign you in right now. Please try again.");
    }
  });

  return (
    <Card className="mx-auto max-w-md rounded-[1.5rem]">
      <div className="mb-6 flex items-center justify-between">
        <Badge tone="accent">Secure sign-in</Badge>
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">JWT session</p>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="login-email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="login-email" type="email" {...form.register("email")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" />
          <p className="mt-1 text-sm text-red-700">{form.formState.errors.email?.message}</p>
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1 block text-sm font-medium">Password</label>
          <input id="login-password" type="password" {...form.register("password")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" />
          <p className="mt-1 text-sm text-red-700">{form.formState.errors.password?.message}</p>
        </div>
        {serverError ? <p className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{serverError}</p> : null}
        <button type="submit" disabled={form.formState.isSubmitting} className="w-full rounded-full bg-[var(--accent)] px-4 py-3 text-white shadow-[0_14px_34px_rgba(159,79,45,0.18)] disabled:opacity-60">Log in</button>
        <div className="flex justify-between text-sm text-stone-600">
          <Link href="/forgot-password">Forgot password?</Link>
          <Link href="/register">Create account</Link>
        </div>
      </form>
    </Card>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", first_name: "", last_name: "", password: "", confirm_password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setServerError(null);
      await register(values);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        return;
      }
      setServerError("We could not create the account right now. Please try again.");
    }
  });

  return (
    <Card className="mx-auto max-w-xl rounded-[1.5rem]">
      <div className="mb-6 flex items-center justify-between">
        <Badge tone="accent">Customer onboarding</Badge>
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Account → booking flow</p>
      </div>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <div>
          <label htmlFor="register-first-name" className="mb-1 block text-sm font-medium">First name</label>
          <input id="register-first-name" {...form.register("first_name")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" />
          <p className="mt-1 text-sm text-red-700">{form.formState.errors.first_name?.message}</p>
        </div>
        <div>
          <label htmlFor="register-last-name" className="mb-1 block text-sm font-medium">Last name</label>
          <input id="register-last-name" {...form.register("last_name")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" />
          <p className="mt-1 text-sm text-red-700">{form.formState.errors.last_name?.message}</p>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="register-email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="register-email" type="email" {...form.register("email")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" />
          <p className="mt-1 text-sm text-red-700">{form.formState.errors.email?.message}</p>
        </div>
        <div>
          <label htmlFor="register-password" className="mb-1 block text-sm font-medium">Password</label>
          <input id="register-password" type="password" {...form.register("password")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" />
          <p className="mt-1 text-sm text-red-700">{form.formState.errors.password?.message}</p>
        </div>
        <div>
          <label htmlFor="register-confirm-password" className="mb-1 block text-sm font-medium">Confirm password</label>
          <input id="register-confirm-password" type="password" {...form.register("confirm_password")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" />
          <p className="mt-1 text-sm text-red-700">{form.formState.errors.confirm_password?.message}</p>
        </div>
        {serverError ? <p className="sm:col-span-2 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{serverError}</p> : null}
        <button type="submit" disabled={form.formState.isSubmitting} className="sm:col-span-2 rounded-full bg-[var(--accent)] px-4 py-3 text-white shadow-[0_14px_34px_rgba(159,79,45,0.18)] disabled:opacity-60">Create account</button>
      </form>
    </Card>
  );
}
