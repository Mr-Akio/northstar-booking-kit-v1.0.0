import { ArrowRight, CalendarRange, Layers3, LayoutPanelTop, LockKeyhole, ShieldCheck } from "lucide-react";

import { Badge, ButtonLink, Card, MetricCard, PageIntro, Section } from "@/components/ui";

export default function HomePage() {
  const presetCards = [
    {
      name: "Default",
      accentClassName: "bg-[#285446]",
      copy: "Neutral marketplace presentation for mixed demos and commercial screenshots.",
    },
    {
      name: "Clinic",
      accentClassName: "bg-[#1f6f67]",
      copy: "Provider, treatment room, and appointment-friendly vocabulary without changing the engine.",
    },
    {
      name: "Meeting",
      accentClassName: "bg-[#35598a]",
      copy: "Workspace, room, and operations language for internal reservation products.",
    },
    {
      name: "Rental",
      accentClassName: "bg-[#8b5a2b]",
      copy: "Asset-oriented positioning for fleets, studios, equipment, or inventory reservations.",
    },
  ];

  return (
    <>
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <PageIntro
            eyebrow="Commercial starter kit"
            title="A premium booking starter that looks credible in screenshots and stays flexible in production."
            description="Northstar Booking Kit is designed to sell as a configurable product shell, not just a code dump. It gives buyers a serious backend, a polished frontend, and a short path from generic booking flow to their own vertical."
            actions={
              <>
                <ButtonLink href="/resources">Browse reference inventory</ButtonLink>
                <ButtonLink href="/dashboard" tone="secondary">Open customer workspace</ButtonLink>
              </>
            }
          />
          <Card className="overflow-hidden border-[color:var(--border-strong)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(243,239,232,0.98))] shadow-[var(--shadow-panel)]">
            <div className="flex items-center justify-between">
              <Badge tone="accent">Commercial V1</Badge>
              <span className="text-xs uppercase tracking-[0.22em] text-stone-500">Preset-ready frontend</span>
            </div>
            <div className="mt-6 rounded-[1.35rem] border border-[color:var(--border)] bg-stone-950 p-5 text-stone-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Product shell preview</p>
                  <p className="mt-2 text-lg font-semibold">The kit should already look like a working product.</p>
                </div>
                <Layers3 className="h-5 w-5 text-white/70" />
              </div>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[1rem] border border-white/10 bg-white/7 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-300">Public catalog</span>
                    <span className="text-stone-50">Search, pricing, capacity</span>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1rem] border border-white/10 bg-white/7 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Customer</p>
                    <p className="mt-2 text-sm text-stone-50">Dashboard, bookings, profile, checkout</p>
                  </div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/7 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Operator</p>
                    <p className="mt-2 text-sm text-stone-50">Resource admin, booking queues, status actions</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between rounded-[1rem] border border-[color:var(--border)] bg-white px-4 py-4 text-stone-900">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Built to rebrand</p>
                <p className="mt-1 text-sm text-stone-600">Swap preset, copy, terminology, and color without rewriting page structure.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-[var(--accent)]" />
            </div>
          </Card>
        </div>
      </Section>
      <Section>
        <div className="grid gap-4 lg:grid-cols-4">
          <MetricCard label="Role surfaces" value="3" detail="Customer, staff, and admin flows designed to feel related but purpose-built." />
          <MetricCard label="Pricing modes" value="3" detail="Fixed, hourly, and daily pricing without trusting totals from the frontend." />
          <MetricCard label="Booking trust" value="DB-backed" detail="Conflict prevention is enforced in transactions and reinforced in PostgreSQL." />
          <MetricCard label="Customization" value="Config-first" detail="Branding, copy, and terminology stay centralized instead of scattered through pages." />
        </div>
      </Section>
      <Section>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="bg-stone-950 text-stone-50">
            <Badge tone="accent">Why it sells better</Badge>
            <h2 className="mt-5 font-serif text-3xl">This should feel like a reference application, not a niche mockup.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300">
              Buyers do not just evaluate features. They evaluate whether the starter already has sensible hierarchy, realistic operations pages, and a branding surface that does not force a rewrite. That is the level this kit aims for.
            </p>
            <div className="mt-8 grid gap-3">
              {["Neutral domain vocabulary", "Operator-facing admin surfaces", "Structured public catalog and detail flow"].map((item) => (
                <div key={item} className="rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-200">
                  {item}
                </div>
              ))}
            </div>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              [CalendarRange, "Availability-first", "Rules and blackout windows stay central so the booking engine stays trustworthy."],
              [LockKeyhole, "Conflict-aware", "Double-booking prevention combines transactions, row locking, and PostgreSQL strategy."],
              [ShieldCheck, "Production-minded", "Permissions, auth, and role boundaries are already part of the product surface."],
              [LayoutPanelTop, "Ready to extend", "The shell, cards, and navigation now behave more like a product system than a demo page."],
            ].map(([Icon, title, copy]) => (
              <Card key={title as string}>
                <Icon className="h-5 w-5 text-[var(--accent)]" />
                <h2 className="mt-5 text-xl font-semibold">{title as string}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{copy as string}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>
      <Section>
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,240,232,0.98))]">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Adaptation path</p>
            <h2 className="mt-3 font-serif text-3xl text-stone-950">The goal is to shorten the distance between starter kit and sellable product.</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Keep the booking engine, swap the vocabulary, replace the imagery, and extend the operational fields. Buyers should feel like they are customizing, not rebuilding.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["Clinic", "Meeting space", "Salon", "Rental fleet", "Studio", "Venue"].map((item) => (
                <span key={item} className="rounded-full border border-[color:var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-sm text-stone-700">
                  {item}
                </span>
              ))}
            </div>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            {presetCards.map((preset) => (
              <Card key={preset.name} className="flex h-full flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${preset.accentClassName}`} />
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{preset.name} preset</p>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-stone-950">{preset.name} demo positioning</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{preset.copy}</p>
                </div>
                <div className="mt-5 rounded-[1rem] border border-[color:var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-stone-600">
                  Screenshot-friendly without locking the buyer into one industry.
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
