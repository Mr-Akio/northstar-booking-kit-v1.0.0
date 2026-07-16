"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Badge, Card, EmptyState, ErrorState, LoadingState, MetricCard, PageIntro, Section } from "@/components/ui";
import { bookingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { humanizeValue, statusTone } from "@/lib/presentation";
import { formatDateTime } from "@/lib/utils";

export default function AdminBookingsPage() {
  const { accessToken } = useAuth();
  const query = useQuery({ queryKey: ["admin-bookings"], queryFn: () => bookingApi.list(accessToken ?? ""), enabled: Boolean(accessToken) });
  const bookings = query.data?.data ?? [];

  return (
    <Section>
      <div className="space-y-8">
        <PageIntro eyebrow="Admin bookings" title="Operational booking visibility for support and staff teams." description="The same booking records serve customers, staff, and admins, with the backend permission layer deciding what each role can access. The admin view should surface queue context, not just raw records." />
        {query.isPending && <LoadingState label="Loading booking operations" />}
        {query.isError && <ErrorState title="Could not load bookings" message="You may need staff or admin permissions for this page." />}
        {query.data?.data.length === 0 && <EmptyState title="No bookings found" message="Create bookings from the customer flow or seed demo data to populate this queue." />}
        <div className="grid gap-4 lg:grid-cols-4">
          <MetricCard label="Total queue" value={String(bookings.length)} detail="All bookings visible to this operator role." />
          <MetricCard label="Pending" value={String(bookings.filter((booking) => booking.status === "pending").length)} detail="These usually need review or follow-up." />
          <MetricCard label="Confirmed" value={String(bookings.filter((booking) => booking.status === "confirmed").length)} detail="These currently block availability." />
          <MetricCard label="Exceptions" value={String(bookings.filter((booking) => booking.status === "cancelled" || booking.status === "rejected").length)} detail="Cancelled and rejected records worth reviewing." />
        </div>
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={statusTone(booking.status)}>{humanizeValue(booking.status)}</Badge>
                    <span className="text-xs uppercase tracking-[0.18em] text-stone-500">{booking.booking_reference}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-stone-950">{booking.resource.name}</h2>
                    <p className="mt-1 text-sm text-stone-600">{booking.user.first_name} {booking.user.last_name} · {formatDateTime(booking.start_datetime)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <p className="text-sm text-stone-500">Role-sensitive booking queue</p>
                  <Link href={`/admin/bookings/${booking.id}`} className="rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm text-stone-900 hover:-translate-y-0.5 hover:border-stone-950">Open booking</Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
