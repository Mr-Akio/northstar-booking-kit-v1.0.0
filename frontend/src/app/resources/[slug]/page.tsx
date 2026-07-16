"use client";

import Image from "next/image";
import Link from "next/link";
import { addDays } from "date-fns";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Badge, ButtonLink, Card, EmptyState, ErrorState, LoadingState, MetricCard, PageIntro, Section } from "@/components/ui";
import { resourceApi } from "@/lib/api";
import { formatDurationRange, humanizeValue, pricingModeLabel, statusTone } from "@/lib/presentation";
import { formatCurrency } from "@/lib/utils";

export default function ResourceDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const today = new Date();
  const startDate = today.toISOString().slice(0, 10);
  const endDate = addDays(today, 6).toISOString().slice(0, 10);
  const resourceQuery = useQuery({ queryKey: ["resource", slug], queryFn: () => resourceApi.detailBySlug(slug), enabled: Boolean(slug) });
  const availabilityQuery = useQuery({
    queryKey: ["availability", slug],
    queryFn: async () => {
      const resource = (await resourceApi.detailBySlug(slug)).data;
      return resourceApi.availability(resource.id, startDate, endDate);
    },
    enabled: Boolean(slug),
  });

  if (resourceQuery.isPending) {
    return <Section><LoadingState label="Loading resource" /></Section>;
  }
  if (resourceQuery.isError || !resourceQuery.data) {
    return <Section><ErrorState title="Resource unavailable" message="We could not load this resource right now." /></Section>;
  }

  const resource = resourceQuery.data.data;
  const gallery = resource.images.length ? resource.images : [{ id: 0, image_url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80", alt_text: resource.name, sort_order: 0 }];
  const formatTime = (value: string) => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));

  return (
    <Section>
      <div className="space-y-8">
        <PageIntro
          eyebrow="Resource detail"
          title={resource.name}
          description={resource.full_description}
          actions={
            <>
              <Badge tone="accent">{humanizeValue(resource.category)}</Badge>
              <Badge tone={statusTone(resource.status)}>{humanizeValue(resource.status)}</Badge>
            </>
          }
        />
        <div className="grid gap-5 md:grid-cols-4">
          <MetricCard label="Starting price" value={formatCurrency(resource.price, resource.currency)} detail={pricingModeLabel(resource.price_mode)} />
          <MetricCard label="Capacity" value={`${resource.capacity}`} detail="Guest or attendee limit exposed directly in the catalog." />
          <MetricCard label="Booking window" value={formatDurationRange(resource.min_booking_duration, resource.max_booking_duration)} detail="Minimum and maximum duration are already enforced by the backend." />
          <MetricCard label="Mode" value={humanizeValue(resource.duration_mode)} detail="Supports flexible or fixed-slot style products." />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {gallery.map((image) => (
                <div key={image.id} className="relative h-64 overflow-hidden rounded-[1.25rem] border border-[color:var(--border)]">
                  <Image src={image.image_url} alt={image.alt_text} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                </div>
              ))}
            </div>
            <Card>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">What this page should prove</p>
                  <h2 className="mt-2 text-2xl font-semibold text-stone-950">The starter already knows how to present a bookable asset clearly.</h2>
                </div>
                <div className="grid gap-2 text-sm text-stone-600">
                  <div className="flex items-center justify-between gap-8"><span>Price model</span><span className="font-medium text-stone-900">{pricingModeLabel(resource.price_mode)}</span></div>
                  <div className="flex items-center justify-between gap-8"><span>Duration mode</span><span className="font-medium text-stone-900">{humanizeValue(resource.duration_mode)}</span></div>
                  <div className="flex items-center justify-between gap-8"><span>Slug</span><span className="font-medium text-stone-900">{resource.slug}</span></div>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Why this page matters commercially</p>
                  <h2 className="mt-2 text-2xl font-semibold text-stone-950">A buyer should be able to imagine their own inventory here in seconds.</h2>
                  <p className="mt-3 text-sm leading-7 text-stone-600">
                    This page exposes pricing, capacity, duration boundaries, and near-term availability without locking the UI to one industry. It is meant to be a strong default detail surface rather than a throwaway demo.
                  </p>
                </div>
                <div className="grid gap-2 text-sm text-stone-600">
                  {["Works with services or spaces", "Keeps booking constraints visible", "Bridges into checkout cleanly"].map((item) => (
                    <div key={item} className="rounded-full border border-[color:var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-center">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            <Card>
              <h2 className="text-xl font-semibold">Availability for the next seven days</h2>
              <div className="mt-4 space-y-4">
                {availabilityQuery.isPending && <LoadingState label="Checking availability" />}
                {availabilityQuery.isError && <ErrorState title="Availability unavailable" message="The backend did not return availability right now." />}
                {availabilityQuery.data?.data.map((day) => (
                  <div key={day.date} className="border-t border-[color:var(--border)] pt-4 first:border-t-0 first:pt-0">
                    <h3 className="font-medium text-stone-900">{day.date}</h3>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {day.windows.length === 0 && <EmptyState title="Closed" message="No booking windows on this date." />}
                      {day.windows.map((window) => (
                        <div key={window.start} className={`rounded-[1rem] border px-3 py-3 text-sm ${window.is_available ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-[color:var(--border)] bg-[var(--surface-muted)] text-stone-600"}`}>
                          <p>{formatTime(window.start)} - {formatTime(window.end)}</p>
                          <p className="mt-1 text-xs">{window.is_available ? "Available" : window.reason ?? "Unavailable"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <Card className="h-fit space-y-6 lg:sticky lg:top-32">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Booking panel</p>
              <p className="mt-3 text-4xl font-semibold text-stone-950">{formatCurrency(resource.price, resource.currency)}</p>
              <p className="mt-2 text-sm text-stone-600">{pricingModeLabel(resource.price_mode)} · backend recalculates totals and availability at submit time.</p>
            </div>
            <div className="grid gap-3 rounded-[1rem] border border-[color:var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-stone-600">
              <div className="flex justify-between gap-6"><span>Capacity</span><span className="font-medium text-stone-900">{resource.capacity} guests</span></div>
              <div className="flex justify-between gap-6"><span>Duration</span><span className="text-right font-medium text-stone-900">{formatDurationRange(resource.min_booking_duration, resource.max_booking_duration)}</span></div>
              <div className="flex justify-between gap-6"><span>Category</span><span className="font-medium text-stone-900">{humanizeValue(resource.category)}</span></div>
              <div className="flex justify-between gap-6"><span>Status</span><span className="font-medium text-stone-900">{humanizeValue(resource.status)}</span></div>
            </div>
            <ButtonLink href={`/checkout/${resource.slug}`} className="w-full">Book this resource</ButtonLink>
            <div className="rounded-[1rem] border border-[color:var(--border)] bg-white p-4 text-sm leading-6 text-stone-600">
              Buyers can restyle this panel for appointments, rooms, desks, vehicles, or sessions without changing the booking rules underneath.
            </div>
            <Link href="/resources" className="inline-flex text-sm text-stone-600 hover:text-stone-950">Return to catalog</Link>
          </Card>
        </div>
      </div>
    </Section>
  );
}
