"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Badge, ButtonLink, Card, EmptyState, ErrorState, LoadingState, MetricCard, PageIntro, Section } from "@/components/ui";
import { resourceApi } from "@/lib/api";
import { formatDurationRange, humanizeValue, pricingModeLabel, statusTone } from "@/lib/presentation";
import { formatCurrency } from "@/lib/utils";

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["resources", search], queryFn: () => resourceApi.list(search) });
  const resources = query.data?.data ?? [];
  const categoryCount = new Set(resources.map((resource) => resource.category)).size;
  const capacityPeak = Math.max(0, ...resources.map((resource) => resource.capacity));

  return (
    <Section>
      <div className="space-y-8">
        <PageIntro
          eyebrow="Reference catalog"
          title="Browse a neutral inventory surface that still feels like commercial booking software."
          description="This catalog is intentionally broad but not bland. Buyers should be able to map it to rooms, staff calendars, treatment slots, rental assets, or reservable spaces without rebuilding the browsing experience."
          actions={<ButtonLink href="/admin/resources" tone="secondary">View admin inventory</ButtonLink>}
        />
        <div className="grid gap-4 lg:grid-cols-4">
          <MetricCard label="Visible resources" value={String(query.data?.pagination.count ?? 0)} detail="Published records available through the public catalog." />
          <MetricCard label="Categories" value={String(categoryCount)} detail="One generic model can represent multiple business shapes." />
          <MetricCard label="Capacity range" value={capacityPeak ? `Up to ${capacityPeak}` : "Waiting"} detail="Capacity stays part of the decision-making surface, not hidden in details." />
          <MetricCard label="Search surface" value="Live" detail="Search is wired to the API so the kit already behaves like a product, not static content." />
        </div>
        <Card className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Filter starting point</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">Give buyers a catalog that is calm, structured, and easy to reposition.</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Search-ready", "Capacity-aware", "Price-visible", "API-backed"].map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
          </div>
          <div className="w-full max-w-lg">
            <label htmlFor="resource-search" className="mb-2 block text-sm font-medium">Search resources</label>
            <input id="resource-search" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-5 py-3 text-sm" placeholder="Search by name or description" />
          </div>
        </Card>
        {query.isPending && <LoadingState label="Loading resources" />}
        {query.isError && <ErrorState title="Could not load resources" message="Please check the API connection and try again." />}
        {query.data?.pagination.count === 0 && <EmptyState title="No resources yet" message="Seed demo data or create your first resource from the admin area." />}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => {
            const previewImage = resource.images[0];
            return (
              <Card key={resource.id} className="group flex h-full flex-col overflow-hidden p-0">
                <div className="relative h-52 border-b border-[color:var(--border)] bg-[linear-gradient(135deg,var(--accent-soft),#f8f2ec)]">
                  {previewImage ? (
                    <Image src={previewImage.image_url} alt={previewImage.alt_text} fill sizes="(max-width: 1280px) 50vw, 33vw" className="object-cover transition duration-300 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="flex h-full items-end bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--accent)_20%,transparent),transparent_45%)] p-5">
                      <Badge tone="accent">Configurable catalog card</Badge>
                    </div>
                  )}
                </div>
                <div className="flex h-full flex-col justify-between gap-6 p-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="accent">{humanizeValue(resource.category)}</Badge>
                      <Badge tone={statusTone(resource.status)}>{humanizeValue(resource.status)}</Badge>
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-stone-950">{resource.name}</h2>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{resource.short_description}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-3 rounded-[1rem] border border-[color:var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-stone-600">
                      <div className="flex items-center justify-between"><span>Capacity</span><span className="font-medium text-stone-900">{resource.capacity}</span></div>
                      <div className="flex items-center justify-between"><span>Pricing</span><span className="font-medium text-stone-900">{formatCurrency(resource.price, resource.currency)}</span></div>
                      <div className="flex items-center justify-between"><span>Mode</span><span className="font-medium text-stone-900">{pricingModeLabel(resource.price_mode)}</span></div>
                      <div className="flex items-center justify-between"><span>Duration</span><span className="text-right font-medium text-stone-900">{formatDurationRange(resource.min_booking_duration, resource.max_booking_duration)}</span></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-stone-500">Reusable for catalog, appointment, or rental flows.</p>
                      <Link href={`/resources/${resource.slug}`} className="inline-flex items-center rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm text-stone-900 hover:-translate-y-0.5 hover:border-stone-950">
                        View details
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
