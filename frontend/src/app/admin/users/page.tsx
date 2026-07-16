"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Badge, Card, ErrorState, LoadingState, MetricCard, PageIntro, Section } from "@/components/ui";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { humanizeValue, statusTone } from "@/lib/presentation";

export default function AdminUsersPage() {
  const { accessToken } = useAuth();
  const query = useQuery({ queryKey: ["admin-users"], queryFn: () => authApi.users(accessToken ?? ""), enabled: Boolean(accessToken) });
  const users = query.data?.data ?? [];

  return (
    <Section>
      <div className="space-y-8">
        <PageIntro eyebrow="Admin users" title="Inspect accounts across customer, staff, and admin roles." description="This view uses the backend admin-only user listing endpoint so user management starts from real authorization boundaries." />
        {query.isPending && <LoadingState label="Loading users" />}
        {query.isError && <ErrorState title="Could not load users" message="You may need an admin account to access this page." />}
        <div className="grid gap-4 lg:grid-cols-4">
          <MetricCard label="Total users" value={String(users.length)} detail="Accounts visible through the admin-only endpoint." />
          <MetricCard label="Customers" value={String(users.filter((user) => user.role === "customer").length)} detail="End-user accounts that can place bookings." />
          <MetricCard label="Staff" value={String(users.filter((user) => user.role === "staff").length)} detail="Operators assigned to resources and booking actions." />
          <MetricCard label="Admins" value={String(users.filter((user) => user.role === "admin").length)} detail="Full access accounts including Django admin." />
        </div>
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{user.first_name} {user.last_name}</h2>
                  <p className="text-sm text-stone-600">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-stone-500">
                  <Badge tone="accent">{humanizeValue(user.role)}</Badge>
                  <Badge tone={statusTone(user.is_verified ? "verified" : "pending")}>{user.is_verified ? "Verified" : "Pending"}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Link href="/admin" className="inline-flex rounded-full border border-[color:var(--border-strong)] px-4 py-3 text-sm text-stone-900">Back to admin overview</Link>
      </div>
    </Section>
  );
}
