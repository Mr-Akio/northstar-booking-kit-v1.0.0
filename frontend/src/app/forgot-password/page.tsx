"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { Badge, Card, PageIntro, Section } from "@/components/ui";
import { authApi } from "@/lib/api";

const schema = z.object({
  email: z.email("Enter a valid email address."),
});

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "" } });
  const onSubmit = form.handleSubmit(async (values) => {
    await authApi.forgotPassword(values.email);
    setSubmitted("If the account exists, a reset link has been sent.");
    form.reset();
  });

  return (
    <Section>
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <Card className="space-y-6">
          <Badge tone="accent">Security-aware recovery</Badge>
          <h2 className="font-serif text-3xl text-stone-950">Password recovery should look professional and still avoid user enumeration.</h2>
          <p className="text-sm leading-7 text-stone-600">The backend always responds generically here. The frontend keeps that same posture while still giving the user a clear next step.</p>
        </Card>
        <div className="space-y-8">
          <PageIntro eyebrow="Password recovery" title="Send a reset link without exposing whether an account exists." description="This mirrors the backend's generic recovery response and keeps user-enumeration risk low." />
          <Card className="mx-auto max-w-md">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium">Email</label>
              <input id="forgot-email" type="email" {...form.register("email")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" />
              <p className="mt-1 text-sm text-red-700">{form.formState.errors.email?.message}</p>
            </div>
            {submitted ? <p className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{submitted}</p> : null}
            <button type="submit" className="w-full rounded-full bg-[var(--accent)] px-4 py-3 text-white shadow-[0_14px_34px_rgba(159,79,45,0.18)]">Send reset link</button>
          </form>
          </Card>
        </div>
      </div>
    </Section>
  );
}
