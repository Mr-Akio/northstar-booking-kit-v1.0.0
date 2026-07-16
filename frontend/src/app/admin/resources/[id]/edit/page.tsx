"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { mapResourceToForm, ResourceEditor } from "@/components/resource-editor";
import { Card, ErrorState, LoadingState, PageIntro, Section } from "@/components/ui";
import { resourceApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function EditResourcePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { accessToken } = useAuth();
  const query = useQuery({ queryKey: ["admin-resource", params.id], queryFn: () => resourceApi.detail(accessToken ?? "", params.id), enabled: Boolean(accessToken && params.id) });

  return (
    <Section>
      <div className="space-y-8">
        <PageIntro eyebrow="Edit resource" title="Update resource details, pricing, and nested availability data." description="Edits are pushed through the same serializer used by the API, including nested image, availability, and blackout records." />
        {query.isPending && <LoadingState label="Loading resource editor" />}
        {query.isError && <ErrorState title="Could not load resource" message="This resource may be unavailable or outside your permissions." />}
        {query.data && (
          <Card>
            <ResourceEditor
              initial={mapResourceToForm(query.data.data)}
              submitLabel="Save changes"
              onSubmit={async (values) => {
                if (!accessToken) return;
                await resourceApi.update(accessToken, params.id, values);
                router.refresh();
              }}
            />
          </Card>
        )}
      </div>
    </Section>
  );
}
