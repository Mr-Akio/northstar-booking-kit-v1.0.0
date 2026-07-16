"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Badge, ButtonLink, Card, EmptyState, ErrorState, LoadingState, MetricCard, PageIntro, Section } from "@/components/ui";
import { authApi, resourceApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDurationRange, humanizeValue, pricingModeLabel, statusTone } from "@/lib/presentation";

export default function AdminResourcesPage() {
  const { accessToken } = useAuth();
  const resourcesQuery = useQuery({ queryKey: ["admin-resources"], queryFn: () => resourceApi.adminList(accessToken ?? ""), enabled: Boolean(accessToken) });
  const usersQuery = useQuery({ queryKey: ["admin-users-for-resources"], queryFn: () => authApi.users(accessToken ?? ""), enabled: Boolean(accessToken) });
  const resources = resourcesQuery.data?.data ?? [];

  const handleDelete = async (resourceId: string) => {
    if (!accessToken) return;
    if (!confirm("Delete this resource? This action cannot be undone.")) return;
    await resourceApi.remove(accessToken, resourceId);
    await resourcesQuery.refetch();
  };

  return (
    <Section>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <PageIntro eyebrow="Admin resources" title="Resource inventory for staff and admin operators." description="Create, edit, archive, and manage availability from the same generic resource model used by the public booking flow. This should read like an inventory workspace, not a loose collection of cards." />
          <ButtonLink href="/admin/resources/new">Create resource</ButtonLink>
        </div>
        {resourcesQuery.isPending && <LoadingState label="Loading managed resources" />}
        {resourcesQuery.isError && <ErrorState title="Could not load resources" message="You may need a staff or admin account to access this area." />}
        {resourcesQuery.data?.data.length === 0 && <EmptyState title="No resources yet" message="Create the first resource to start configuring inventory." />}
        <div className="grid gap-4 lg:grid-cols-4">
          <MetricCard label="Managed inventory" value={String(resources.length)} detail="Records currently visible to this operator role." />
          <MetricCard label="Published" value={String(resources.filter((resource) => resource.status === "published").length)} detail="Resources available to public booking flows." />
          <MetricCard label="Draft" value={String(resources.filter((resource) => resource.status === "draft").length)} detail="Records still being configured." />
          <MetricCard label="Assignable users" value={String(usersQuery.data?.pagination.count ?? 0)} detail="Staff and admin users currently available for primary ownership." />
        </div>
        <div className="grid gap-4">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="accent">{humanizeValue(resource.category)}</Badge>
                    <Badge tone={statusTone(resource.status)}>{humanizeValue(resource.status)}</Badge>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-stone-950">{resource.name}</h2>
                    <p className="mt-1 text-sm text-stone-600">{resource.short_description}</p>
                  </div>
                  <div className="grid gap-2 text-sm text-stone-500 sm:grid-cols-2">
                    <p>Capacity: <span className="font-medium text-stone-900">{resource.capacity}</span></p>
                    <p>Pricing: <span className="font-medium text-stone-900">{pricingModeLabel(resource.price_mode)}</span></p>
                    <p>Duration: <span className="font-medium text-stone-900">{formatDurationRange(resource.min_booking_duration, resource.max_booking_duration)}</span></p>
                    <p>Staff owner: <span className="font-medium text-stone-900">{resource.primary_staff_details ? `${resource.primary_staff_details.first_name} ${resource.primary_staff_details.last_name}` : "Unassigned"}</span></p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/resources/${resource.id}/edit`} className="rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm text-stone-900 hover:-translate-y-0.5 hover:border-stone-950">Edit</Link>
                  <Link href={`/admin/resources/${resource.id}/availability`} className="rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm text-stone-900 hover:-translate-y-0.5 hover:border-stone-950">Availability</Link>
                  <button type="button" onClick={() => void handleDelete(resource.id)} className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700 hover:-translate-y-0.5 hover:border-red-500">Delete</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card>
          <h2 className="text-lg font-semibold">Admin note</h2>
          <p className="mt-2 text-sm text-stone-600">Primary staff assignment uses direct user IDs for v1. Staff and admin users available for assignment: {usersQuery.data?.pagination.count ?? 0}.</p>
        </Card>
      </div>
    </Section>
  );
}
