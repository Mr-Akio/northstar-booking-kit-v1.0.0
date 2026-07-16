"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Badge, ButtonLink, Card, ErrorState, LoadingState, MetricCard, PageIntro, Section } from "@/components/ui";
import { bookingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { humanizeValue, statusTone } from "@/lib/presentation";
import { formatDateTime } from "@/lib/utils";

export default function BookingConfirmationPage() {
  const params = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const query = useQuery({ queryKey: ["booking-confirmation", params.id], queryFn: () => bookingApi.detail(accessToken ?? "", params.id), enabled: Boolean(accessToken && params.id) });

  return (
    <Section>
      <div className="space-y-8">
        <PageIntro eyebrow="Confirmation" title="The booking has been created and stored on the backend." description="From here we can hand the customer back a stable reference and let staff or admin act on the state machine later." />
        {query.isPending && <LoadingState label="Loading booking confirmation" />}
        {query.isError && <ErrorState title="Booking unavailable" message="We could not load the booking confirmation details." />}
        {query.data && (
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <MetricCard label="Reference" value={query.data.data.booking_reference} detail="A stable booking identifier returned by the backend." />
            <Card className="max-w-3xl">
              <div className="mb-6 flex items-center justify-between">
                <Badge tone={statusTone(query.data.data.status)}>{humanizeValue(query.data.data.status)}</Badge>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Stored successfully</p>
              </div>
              <h2 className="text-3xl font-semibold text-stone-950">{query.data.data.resource.name}</h2>
              <dl className="mt-6 grid gap-3 text-sm text-stone-700">
                <div className="flex justify-between"><dt>Resource</dt><dd>{query.data.data.resource.name}</dd></div>
                <div className="flex justify-between"><dt>Start</dt><dd>{formatDateTime(query.data.data.start_datetime)}</dd></div>
                <div className="flex justify-between"><dt>End</dt><dd>{formatDateTime(query.data.data.end_datetime)}</dd></div>
                <div className="flex justify-between"><dt>Status</dt><dd>{humanizeValue(query.data.data.status)}</dd></div>
              </dl>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/bookings">Go to my bookings</ButtonLink>
                <Link href="/resources" className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-3 text-sm text-stone-900">Browse more resources</Link>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Section>
  );
}
