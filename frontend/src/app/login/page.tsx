import { LoginForm } from "@/components/auth-form";
import { Badge, Card, PageIntro, Section } from "@/components/ui";

export default function LoginPage() {
  return (
    <Section>
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <Card className="space-y-6 bg-stone-950 text-stone-50">
          <Badge tone="accent">Commercial V1 auth</Badge>
          <PageIntro
            eyebrow="Sign in"
            title="Return to your booking workspace."
            description="Access customer, staff, or admin workflows with the same authentication foundation used by the full booking flow."
            className="text-stone-50"
          />
          <div className="grid gap-3">
            {[
              "Refresh-token rotation and blacklist are already wired in the backend.",
              "The same sign-in surface works for customer, staff, and admin roles.",
              "Error feedback now surfaces failed credentials instead of failing silently.",
            ].map((item) => (
              <div key={item} className="rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-200">
                {item}
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-8">
          <PageIntro eyebrow="Secure workspace entry" title="A polished auth flow matters when you sell a starter kit." description="Buyers judge product quality quickly. This version gives them a cleaner sign-in screen, clearer validation, and behavior that already respects backend auth rules." />
          <LoginForm />
        </div>
      </div>
    </Section>
  );
}
