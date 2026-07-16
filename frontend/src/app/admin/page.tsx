"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Badge, ButtonLink, Card, ErrorState, LoadingState, MetricCard, PageIntro, Section } from "@/components/ui";
import { bookingApi, resourceApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AdminPage() {
  const { accessToken } = useAuth();
  const bookingsQuery = useQuery({ queryKey: ["admin-dashboard-bookings"], queryFn: () => bookingApi.list(accessToken ?? ""), enabled: Boolean(accessToken) });
  const resourcesQuery = useQuery({ queryKey: ["admin-dashboard-resources"], queryFn: () => resourceApi.adminList(accessToken ?? ""), enabled: Boolean(accessToken) });
  const bookings = bookingsQuery.data?.data ?? [];
  const resources = resourcesQuery.data?.data ?? [];

  return (
    <Section>
      <div className="space-y-8">
        <PageIntro
          eyebrow="Operations"
          title="Run the starter like an operator console, not a placeholder admin landing page."
          description="A sellable booking kit needs a practical back office. These screens should communicate queue health, inventory shape, and the next actions staff or admins can take without looking decorative."
          actions={<ButtonLink href="/admin/bookings">Open booking queue</ButtonLink>}
        />
        {(bookingsQuery.isPending || resourcesQuery.isPending) && <LoadingState label="Loading operator workspace" />}
        {(bookingsQuery.isError || resourcesQuery.isError) && <ErrorState title="Could not load operations summary" message="You may need staff or admin permissions for this area." />}
        <div className="grid gap-4 lg:grid-cols-4">
          <MetricCard label="Bookings" value={String(bookings.length)} detail="Operational records available to the signed-in role." />
          <MetricCard label="Inventory" value={String(resources.length)} detail="Resources currently managed by this account or team." />
          <MetricCard label="Pending" value={String(bookings.filter((booking) => booking.status === "pending").length)} detail="Reservations still waiting for staff action or customer follow-through." />
          <MetricCard label="Confirmed" value={String(bookings.filter((booking) => booking.status === "confirmed").length)} detail="Committed bookings that currently block availability." />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["/admin/resources", "Resource management", "Review inventory, assign staff ownership, and keep the public catalog aligned with operations."],
            ["/admin/bookings", "Booking management", "Work through pending, confirmed, cancelled, and completed bookings from one queue."],
            ["/admin/users", "User management", "Inspect customer, staff, and admin accounts using backend-backed role data."],
          ].map(([href, title, description]) => (
            <Card key={href}>
              <Badge tone="accent">Operator surface</Badge>
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-stone-600">{description}</p>
              <Link href={href} className="mt-4 inline-flex rounded-full border border-[color:var(--border-strong)] px-4 py-3 text-sm text-stone-900 hover:-translate-y-0.5 hover:border-stone-950">Open</Link>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
