import { RegisterForm } from "@/components/auth-form";
import { Badge, Card, PageIntro, Section } from "@/components/ui";

export default function RegisterPage() {
  return (
    <Section>
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="space-y-8">
          <PageIntro eyebrow="Create account" title="Launch a real customer journey from sign-up to booking." description="The starter is wired so registration can flow directly into authenticated booking, account management, and customer workspace pages." />
          <RegisterForm />
        </div>
        <Card className="space-y-6">
          <Badge tone="accent">Buyer-facing onboarding</Badge>
          <h2 className="font-serif text-3xl text-stone-950">The goal is not a pretty form. The goal is a believable first-use experience.</h2>
          <p className="text-sm leading-7 text-stone-600">
            When a buyer spins up the demo, registration should already feel like part of a coherent product. This page is designed to prove the starter can carry a user from account creation into the booking lifecycle without custom work on day one.
          </p>
          <div className="grid gap-3">
            {["Validation and backend errors surfaced in the UI", "Role-aware auth structure already in place", "Designed to be rebranded without rewriting form logic"].map((item) => (
              <div key={item} className="rounded-[1rem] border border-[color:var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-stone-700">
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Section>
  );
}
