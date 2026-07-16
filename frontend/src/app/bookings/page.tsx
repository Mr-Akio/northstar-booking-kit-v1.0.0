"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Badge, Card, EmptyState, ErrorState, LoadingState, MetricCard, PageIntro, Section } from "@/components/ui";
import { bookingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { humanizeValue, statusTone } from "@/lib/presentation";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function BookingsPage() {
  const { accessToken, status } = useAuth();
  const query = useQuery({ queryKey: ["bookings"], queryFn: () => bookingApi.list(accessToken ?? ""), enabled: Boolean(accessToken) });
  const bookings = query.data?.data ?? [];

  return (
    <Section>
      <div className="space-y-8">
        <PageIntro eyebrow="Customer bookings" title="Review active, cancelled, and completed reservations from one place." description="This list leans on the backend permission model, so customers only ever see their own bookings. The frontend just turns those records into a cleaner, more dependable workspace." />
        {status !== "authenticated" && <ErrorState title="Login required" message="Please sign in to view your bookings." />}
        {query.isPending && <LoadingState label="Loading bookings" />}
        {query.isError && <ErrorState title="Could not load bookings" message="The booking API did not respond successfully." />}
        {query.data?.data.length === 0 && <EmptyState title="No bookings yet" message="Create a booking from the resource detail page to populate this area." />}
        <div className="grid gap-4 lg:grid-cols-3">
          <MetricCard label="Total records" value={String(bookings.length)} detail="Every reservation stays visible in one history surface." />
          <MetricCard label="Upcoming" value={String(bookings.filter((booking) => booking.status === "pending" || booking.status === "confirmed").length)} detail="Reservations still in motion." />
          <MetricCard label="Cancelled" value={String(bookings.filter((booking) => booking.status === "cancelled").length)} detail="Useful for cancellation policy and support flows later." />
        </div>
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden p-0">
              <div className="grid gap-4 p-5 lg:grid-cols-[1.4fr_0.8fr_0.6fr_auto] lg:items-center">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={statusTone(booking.status)}>{humanizeValue(booking.status)}</Badge>
                    <span className="text-xs uppercase tracking-[0.18em] text-stone-500">{booking.booking_reference}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-stone-950">{booking.resource.name}</h2>
                    <p className="mt-1 text-sm text-stone-600">{formatDateTime(booking.start_datetime)}</p>
                  </div>
                </div>
                <div className="text-sm text-stone-600">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Schedule</p>
                  <p className="mt-2">{formatDateTime(booking.start_datetime)}</p>
                  <p>{formatDateTime(booking.end_datetime)}</p>
                </div>
                <div className="text-sm text-stone-600">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Amount</p>
                  <p className="mt-2 font-medium text-stone-900">{formatCurrency(booking.total_price, booking.resource.currency)}</p>
                </div>
                <Link href={`/bookings/${booking.id}`} className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm text-stone-900 hover:border-stone-950">
                  View details
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
