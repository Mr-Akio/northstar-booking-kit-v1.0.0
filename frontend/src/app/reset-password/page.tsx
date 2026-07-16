"use client";

import { Suspense } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { Badge, Card, LoadingState, PageIntro, Section } from "@/components/ui";
import { authApi } from "@/lib/api";

const schema = z.object({
  new_password: z.string().min(8, "Password must be at least 8 characters."),
  confirm_password: z.string().min(8, "Please confirm your password."),
}).refine((values) => values.new_password === values.confirm_password, { message: "Passwords must match.", path: ["confirm_password"] });

function ResetPasswordInner() {
  const params = useSearchParams();
  const uid = params.get("uid") ?? "";
  const token = params.get("token") ?? "";
  const [submitted, setSubmitted] = useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { new_password: "", confirm_password: "" } });
  const onSubmit = form.handleSubmit(async (values) => {
    await authApi.resetPassword({ uid, token, ...values });
    setSubmitted("Password updated successfully. You can now sign in.");
    form.reset();
  });

  return (
    <Card className="mx-auto max-w-md">
      <div className="mb-6 flex items-center justify-between">
        <Badge tone="accent">Credential reset</Badge>
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Token validated server-side</p>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="new-password" className="mb-1 block text-sm font-medium">New password</label>
          <input id="new-password" type="password" {...form.register("new_password")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" />
          <p className="mt-1 text-sm text-red-700">{form.formState.errors.new_password?.message}</p>
        </div>
        <div>
          <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium">Confirm password</label>
          <input id="confirm-password" type="password" {...form.register("confirm_password")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" />
          <p className="mt-1 text-sm text-red-700">{form.formState.errors.confirm_password?.message}</p>
        </div>
        {submitted ? <p className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{submitted}</p> : null}
        <button type="submit" className="w-full rounded-full bg-[var(--accent)] px-4 py-3 text-white shadow-[0_14px_34px_rgba(159,79,45,0.18)]">Update password</button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Section>
      <div className="space-y-8">
        <PageIntro eyebrow="Reset password" title="Set a new password for this account." description="The backend validates the token and enforces password rules before accepting the reset." />
        <Suspense fallback={<LoadingState label="Loading reset link" />}>
          <ResetPasswordInner />
        </Suspense>
      </div>
    </Section>
  );
}
