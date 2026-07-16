"use client";

import { useRouter } from "next/navigation";

import { ResourceEditor } from "@/components/resource-editor";
import { Card, PageIntro, Section } from "@/components/ui";
import { resourceApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function NewResourcePage() {
  const { accessToken } = useAuth();
  const router = useRouter();

  return (
    <Section>
      <div className="space-y-8">
        <PageIntro eyebrow="Create resource" title="Add a new bookable resource with pricing and availability." description="This flow writes directly to the backend resource API so the starter kit can bootstrap real inventory from the admin surface." />
        <Card>
          <ResourceEditor
            submitLabel="Create resource"
            onSubmit={async (values) => {
              if (!accessToken) return;
              const response = await resourceApi.create(accessToken, values);
              router.push(`/admin/resources/${response.data.id}/edit`);
            }}
          />
        </Card>
      </div>
    </Section>
  );
}
