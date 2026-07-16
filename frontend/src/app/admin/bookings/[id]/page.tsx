"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Badge, Card, ErrorState, LoadingState, PageIntro, Section } from "@/components/ui";
import { bookingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { humanizeValue, statusTone } from "@/lib/presentation";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function AdminBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const query = useQuery({ queryKey: ["admin-booking-detail", params.id], queryFn: () => bookingApi.detail(accessToken ?? "", params.id), enabled: Boolean(accessToken && params.id) });

  const runAction = async (action: "confirm" | "cancel" | "reject" | "complete") => {
    if (!accessToken) return;
    const bookingId = params.id;
    if (action === "confirm") await bookingApi.confirm(accessToken, bookingId);
    if (action === "complete") await bookingApi.complete(accessToken, bookingId);
    if (action === "cancel") await bookingApi.cancel(accessToken, bookingId, prompt("Cancellation reason") ?? "Cancelled by staff/admin");
    if (action === "reject") await bookingApi.reject(accessToken, bookingId, prompt("Rejection reason") ?? "Rejected by staff/admin");
    await query.refetch();
  };

  return (
    <Section>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <PageIntro eyebrow="Booking operations" title="Review and transition a booking through the allowed states." description="The available actions still depend on backend transition rules, so invalid or conflicting changes are blocked at the API layer." />
          <Link href="/admin/bookings" className="rounded-full border border-[color:var(--border-strong)] px-4 py-3 text-sm text-stone-900 hover:-translate-y-0.5 hover:border-stone-950">Back to booking list</Link>
        </div>
        {query.isPending && <LoadingState label="Loading booking detail" />}
        {query.isError && <ErrorState title="Could not load booking" message="This booking may be unavailable or outside your permissions." />}
        {query.data && (
          <Card className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{query.data.data.resource.name}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone={statusTone(query.data.data.status)}>{humanizeValue(query.data.data.status)}</Badge>
                  <span className="text-xs uppercase tracking-[0.18em] text-stone-500">{query.data.data.booking_reference}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void runAction("confirm")} className="rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm text-stone-900 hover:-translate-y-0.5 hover:border-stone-950">Confirm</button>
                <button type="button" onClick={() => void runAction("complete")} className="rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm text-stone-900 hover:-translate-y-0.5 hover:border-stone-950">Complete</button>
                <button type="button" onClick={() => void runAction("reject")} className="rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm text-stone-900 hover:-translate-y-0.5 hover:border-stone-950">Reject</button>
                <button type="button" onClick={() => void runAction("cancel")} className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700 hover:-translate-y-0.5 hover:border-red-500">Cancel</button>
              </div>
            </div>
            <div className="grid gap-3 text-sm text-stone-700 md:grid-cols-2">
              <div className="flex justify-between"><span>Customer</span><span>{query.data.data.user.email}</span></div>
              <div className="flex justify-between"><span>Guests</span><span>{query.data.data.number_of_guests}</span></div>
              <div className="flex justify-between"><span>Start</span><span>{formatDateTime(query.data.data.start_datetime)}</span></div>
              <div className="flex justify-between"><span>End</span><span>{formatDateTime(query.data.data.end_datetime)}</span></div>
              <div className="flex justify-between"><span>Total</span><span>{formatCurrency(query.data.data.total_price, query.data.data.resource.currency)}</span></div>
              <div className="flex justify-between"><span>Status</span><span>{humanizeValue(query.data.data.status)}</span></div>
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
