"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { mapResourceToForm, ResourceEditor } from "@/components/resource-editor";
import { Card, ErrorState, LoadingState, PageIntro, Section } from "@/components/ui";
import { resourceApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AvailabilityManagementPage() {
  const params = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const query = useQuery({ queryKey: ["resource-availability-management", params.id], queryFn: () => resourceApi.detail(accessToken ?? "", params.id), enabled: Boolean(accessToken && params.id) });

  return (
    <Section>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <PageIntro eyebrow="Availability management" title="Control weekly booking windows and blackout periods." description="This page focuses on the scheduling layer that determines when a resource can accept bookings and when it must stay blocked." />
          <Link href={`/admin/resources/${params.id}/edit`} className="rounded-sm border border-stone-300 px-4 py-3 text-sm">Back to full editor</Link>
        </div>
        {query.isPending && <LoadingState label="Loading availability manager" />}
        {query.isError && <ErrorState title="Could not load availability" message="This resource may be unavailable or outside your permissions." />}
        {query.data && (
          <Card>
            <ResourceEditor
              initial={mapResourceToForm(query.data.data)}
              submitLabel="Save availability changes"
              onSubmit={async (values) => {
                if (!accessToken) return;
                await resourceApi.update(accessToken, params.id, {
                  availability_rules: values.availability_rules,
                  blackout_periods: values.blackout_periods,
                  images: values.images,
                  name: values.name,
                  short_description: values.short_description,
                  full_description: values.full_description,
                  category: values.category,
                  capacity: values.capacity,
                  price: values.price,
                  currency: values.currency,
                  price_mode: values.price_mode,
                  duration_mode: values.duration_mode,
                  min_booking_duration: values.min_booking_duration,
                  max_booking_duration: values.max_booking_duration,
                  status: values.status,
                  is_active: values.is_active,
                  primary_staff: values.primary_staff,
                });
              }}
            />
          </Card>
        )}
      </div>
    </Section>
  );
}
