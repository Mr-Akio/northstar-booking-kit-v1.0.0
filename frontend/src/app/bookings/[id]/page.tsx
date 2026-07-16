"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Badge, Card, ErrorState, LoadingState, PageIntro, Section } from "@/components/ui";
import { bookingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { humanizeValue, statusTone } from "@/lib/presentation";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const query = useQuery({ queryKey: ["booking", params.id], queryFn: () => bookingApi.detail(accessToken ?? "", params.id), enabled: Boolean(accessToken && params.id) });

  const cancelBooking = async () => {
    if (!accessToken) return;
    await bookingApi.cancel(accessToken, params.id, "Cancelled by customer from dashboard");
    await query.refetch();
  };

  return (
    <Section>
      <div className="space-y-8">
        <PageIntro eyebrow="Booking details" title="Inspect a single reservation with status, schedule, and notes." description="This page is intentionally structured around real booking data rather than decorative dashboard widgets." />
        {query.isPending && <LoadingState label="Loading booking" />}
        {query.isError && <ErrorState title="Booking unavailable" message="This booking could not be loaded for the current user." />}
        {query.data && (
          <Card className="max-w-3xl space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{query.data.data.resource.name}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone={statusTone(query.data.data.status)}>{humanizeValue(query.data.data.status)}</Badge>
                  <span className="text-xs uppercase tracking-[0.18em] text-stone-500">{query.data.data.booking_reference}</span>
                </div>
              </div>
              {query.data.data.status === "pending" || query.data.data.status === "confirmed" ? (
                <button type="button" onClick={() => void cancelBooking()} className="rounded-full border border-red-300 px-4 py-3 text-sm text-red-700 hover:-translate-y-0.5 hover:border-red-500">Cancel booking</button>
              ) : null}
            </div>
            <div className="grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
              <div className="flex justify-between"><span>Reference</span><span>{query.data.data.booking_reference}</span></div>
              <div className="flex justify-between"><span>Status</span><span>{humanizeValue(query.data.data.status)}</span></div>
              <div className="flex justify-between"><span>Start</span><span>{formatDateTime(query.data.data.start_datetime)}</span></div>
              <div className="flex justify-between"><span>End</span><span>{formatDateTime(query.data.data.end_datetime)}</span></div>
              <div className="flex justify-between"><span>Guests</span><span>{query.data.data.number_of_guests}</span></div>
              <div className="flex justify-between"><span>Total</span><span>{formatCurrency(query.data.data.total_price, query.data.data.resource.currency)}</span></div>
            </div>
            <div>
              <h3 className="font-medium text-stone-900">Notes</h3>
              <p className="mt-2 text-sm text-stone-600">{query.data.data.notes || "No notes provided."}</p>
            </div>
          </Card>
        )}
      </div>
    </Section>
  );
}
