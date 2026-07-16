"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Badge, Card, ErrorState, LoadingState, PageIntro, Section } from "@/components/ui";
import { authApi } from "@/lib/api";

function VerifyEmailInner() {
  const params = useSearchParams();
  const uid = params.get("uid") ?? "";
  const token = params.get("token") ?? "";
  const query = useQuery({ queryKey: ["verify-email", uid, token], queryFn: () => authApi.verifyEmail(uid, token), enabled: Boolean(uid && token) });

  return (
    <Card className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center justify-between">
        <Badge tone="accent">Email verification</Badge>
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Token checked by backend</p>
      </div>
      {query.isPending && <LoadingState label="Verifying email" />}
      {query.isError && <ErrorState title="Verification failed" message="This link is invalid or has expired." />}
      {query.data && <p className="text-sm text-stone-700">Email verified for {query.data.data.email}. You can continue using the booking workspace.</p>}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Section>
      <div className="space-y-8">
        <PageIntro eyebrow="Verification" title="Confirm the account email before deeper rollout." description="This page exercises the backend verification structure so email confirmation is wired from day one." />
        <Suspense fallback={<LoadingState label="Preparing verification" />}>
          <VerifyEmailInner />
        </Suspense>
      </div>
    </Section>
  );
}
