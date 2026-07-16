"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Badge, ButtonLink, Card, EmptyState, ErrorState, LoadingState, MetricCard, PageIntro, Section } from "@/components/ui";
import { bookingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { humanizeValue, statusTone } from "@/lib/presentation";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { accessToken, status, user } = useAuth();
  const bookingsQuery = useQuery({ queryKey: ["dashboard-bookings"], queryFn: () => bookingApi.list(accessToken ?? ""), enabled: Boolean(accessToken) });
  const bookings = bookingsQuery.data?.data ?? [];
  const activeCount = bookings.filter((booking) => booking.status === "pending" || booking.status === "confirmed").length;
  const completedCount = bookings.filter((booking) => booking.status === "completed").length;
  const totalValue = bookings.reduce((sum, booking) => sum + Number(booking.total_price), 0);
  const currency = bookings[0]?.resource.currency ?? "USD";

  return (
    <Section>
      <div className="space-y-8">
        <PageIntro
          eyebrow="Workspace"
          title="Keep current reservations, account context, and next actions in one polished workspace."
          description="A commercial starter kit should not stop at public catalog pages. Buyers also need a signed-in surface that already feels operational instead of a blank dashboard placeholder."
          actions={
            <>
              <ButtonLink href="/resources">Browse resources</ButtonLink>
              <ButtonLink href="/bookings" tone="secondary">View all bookings</ButtonLink>
            </>
          }
        />
        {status !== "authenticated" && <ErrorState title="Sign in required" message="Log in to view your dashboard." />}
        {user ? (
          <div className="grid gap-4 lg:grid-cols-4">
            <MetricCard label="Signed in as" value={`${user.first_name} ${user.last_name}`.trim()} detail={user.email} />
            <MetricCard label="Role" value={humanizeValue(user.role)} detail="Permissions are enforced by the backend, not by hidden frontend state." />
            <MetricCard label="Active bookings" value={String(activeCount)} detail="Pending and confirmed reservations that still require attention." />
            <MetricCard label="Booked value" value={formatCurrency(totalValue, currency)} detail={`Completed bookings: ${completedCount}`} />
          </div>
        ) : null}
        {bookingsQuery.isPending && <LoadingState label="Loading recent bookings" />}
        {bookingsQuery.isError && <ErrorState title="Could not load bookings" message="Please verify the API connection and try again." />}
        {bookingsQuery.data?.data.length === 0 && <EmptyState title="No bookings yet" message="Browse resources and create the first booking to populate this dashboard." />}
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <Card>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Recent bookings</p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-950">A signed-in workspace should expose actionable records immediately.</h2>
              </div>
              <Link href="/bookings" className="text-sm text-stone-600 hover:text-stone-950">See all</Link>
            </div>
            <div className="mt-6 grid gap-4">
              {bookings.slice(0, 4).map((booking) => (
                <div key={booking.id} className="rounded-[1rem] border border-[color:var(--border)] bg-[var(--surface-muted)] p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={statusTone(booking.status)}>{humanizeValue(booking.status)}</Badge>
                        <span className="text-xs uppercase tracking-[0.18em] text-stone-500">{booking.booking_reference}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-stone-950">{booking.resource.name}</h3>
                      <p className="text-sm text-stone-600">{formatCurrency(booking.total_price, booking.resource.currency)}</p>
                    </div>
                    <Link href={`/bookings/${booking.id}`} className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm text-stone-900 hover:border-stone-950">
                      View booking
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <div className="grid gap-4">
            <Card className="space-y-4 bg-stone-950 text-stone-50">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Extension notes</p>
              <h2 className="text-2xl font-semibold text-white">This area is intentionally useful without pretending to be full analytics.</h2>
              <p className="text-sm leading-7 text-stone-300">
                Buyers can extend this workspace into a richer portal without first deleting placeholder charts. The current version prioritizes identity, current bookings, and direct actions.
              </p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Workspace anatomy</p>
              <div className="mt-4 grid gap-3">
                {["Keep role context visible", "Show current booking load", "Provide direct links back into flows", "Leave room for account-specific modules later"].map((item) => (
                  <div key={item} className="rounded-[1rem] border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-stone-700">
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Section>
  );
}
