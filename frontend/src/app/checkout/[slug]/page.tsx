"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge, Card, ErrorState, LoadingState, MetricCard, PageIntro, Section } from "@/components/ui";
import { bookingApi, resourceApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { datetimeLocalToUtcIso } from "@/lib/datetime";
import { formatDurationRange, humanizeValue, pricingModeLabel } from "@/lib/presentation";
import { formatCurrency } from "@/lib/utils";

const schema = z.object({
  start_datetime: z.string().min(1, "Select a start date and time."),
  end_datetime: z.string().min(1, "Select an end date and time."),
  number_of_guests: z.coerce.number().min(1, "At least one guest is required."),
  notes: z.string(),
});

type CheckoutInput = z.input<typeof schema>;
type CheckoutOutput = z.output<typeof schema>;

export default function CheckoutPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { accessToken, status } = useAuth();
  const resourceQuery = useQuery({ queryKey: ["checkout-resource", params.slug], queryFn: () => resourceApi.detailBySlug(params.slug), enabled: Boolean(params.slug) });
  const form = useForm<CheckoutInput, undefined, CheckoutOutput>({ resolver: zodResolver(schema), defaultValues: { start_datetime: "", end_datetime: "", number_of_guests: "1", notes: "" } });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!accessToken || !resourceQuery.data) return;
    const response = await bookingApi.create(accessToken, {
      resource_id: resourceQuery.data.data.id,
      start_datetime: datetimeLocalToUtcIso(values.start_datetime),
      end_datetime: datetimeLocalToUtcIso(values.end_datetime),
      number_of_guests: values.number_of_guests,
      notes: values.notes,
      guests: [],
    });
    router.push(`/booking-confirmation/${response.data.id}`);
  });

  return (
    <Section>
      <div className="space-y-8">
        <PageIntro eyebrow="Checkout" title="Confirm the booking details against the backend before submission." description="The API recalculates price and checks availability again on submit, so the final confirmation never trusts stale UI state." />
        {status !== "authenticated" && <ErrorState title="Login required" message="Please sign in before creating a booking." />}
        {resourceQuery.isPending && <LoadingState label="Loading checkout details" />}
        {resourceQuery.isError && <ErrorState title="Resource unavailable" message="The selected resource could not be loaded." />}
        {resourceQuery.data && (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <MetricCard label="Starting price" value={formatCurrency(resourceQuery.data.data.price, resourceQuery.data.data.currency)} detail={pricingModeLabel(resourceQuery.data.data.price_mode)} />
              <MetricCard label="Capacity" value={`${resourceQuery.data.data.capacity}`} detail="Guest count is still validated again by the backend." />
              <MetricCard label="Duration" value={formatDurationRange(resourceQuery.data.data.min_booking_duration, resourceQuery.data.data.max_booking_duration)} detail="Minimum and maximum booking windows come from the resource model." />
              <Card className="space-y-4">
                <Badge tone="accent">{humanizeValue(resourceQuery.data.data.category)}</Badge>
                <h2 className="text-2xl font-semibold text-stone-950">{resourceQuery.data.data.name}</h2>
                <p className="text-sm leading-7 text-stone-600">{resourceQuery.data.data.short_description}</p>
              </Card>
            </div>
            <Card className="max-w-3xl">
              <div className="mb-6 flex items-center justify-between">
                <Badge tone="accent">Final booking check</Badge>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Backend verifies again</p>
              </div>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
                <div>
                  <label htmlFor="start_datetime" className="mb-1 block text-sm font-medium">Start</label>
                  <input id="start_datetime" type="datetime-local" {...form.register("start_datetime")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" />
                  <p className="mt-1 text-sm text-red-700">{form.formState.errors.start_datetime?.message}</p>
                </div>
                <div>
                  <label htmlFor="end_datetime" className="mb-1 block text-sm font-medium">End</label>
                  <input id="end_datetime" type="datetime-local" {...form.register("end_datetime")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" />
                  <p className="mt-1 text-sm text-red-700">{form.formState.errors.end_datetime?.message}</p>
                </div>
                <div>
                  <label htmlFor="number_of_guests" className="mb-1 block text-sm font-medium">Guests</label>
                  <input id="number_of_guests" type="number" min={1} {...form.register("number_of_guests")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" />
                  <p className="mt-1 text-sm text-red-700">{form.formState.errors.number_of_guests?.message}</p>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="mb-1 block text-sm font-medium">Notes</label>
                  <textarea id="notes" rows={4} {...form.register("notes")} className="w-full rounded-[1rem] border border-[color:var(--border-strong)] bg-white px-4 py-3" />
                </div>
                <button type="submit" disabled={!accessToken} className="sm:col-span-2 rounded-full bg-[var(--accent)] px-4 py-3 text-white shadow-[0_14px_34px_rgba(159,79,45,0.18)] disabled:opacity-60">Create booking</button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </Section>
  );
}
