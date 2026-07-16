import Link from "next/link";
import { AlertCircle, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/lib/presentation";

const badgeToneStyles: Record<BadgeTone, string> = {
  neutral: "border-[color:var(--border)] bg-white text-stone-700",
  accent: "border-[color:var(--accent-soft)] bg-[var(--accent-soft)] text-stone-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-900",
};

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-5", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">{eyebrow}</p>
      <h1 className="max-w-4xl font-serif text-4xl leading-[0.98] text-stone-950 sm:text-5xl lg:text-[4.35rem]">{title}</h1>
      <p className="max-w-3xl text-base leading-7 text-stone-600 sm:text-[1.05rem]">{description}</p>
      {actions ? <div className="flex flex-wrap gap-3 pt-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[1.5rem] border border-[color:var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)]", className)}>{children}</div>;
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: BadgeTone }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]", badgeToneStyles[tone])}>
      {children}
    </span>
  );
}

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="space-y-3 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(250,247,242,0.98))]">
      <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">{label}</p>
      <p className="font-serif text-3xl leading-none text-stone-950">{value}</p>
      <p className="text-sm leading-6 text-stone-600">{detail}</p>
    </Card>
  );
}

export function ButtonLink({
  href,
  children,
  tone = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  tone?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const tones = {
    primary: "bg-[var(--accent)] text-white shadow-[var(--shadow-lift)] hover:-translate-y-0.5 hover:bg-stone-950",
    secondary: "border border-[color:var(--border-strong)] bg-white text-stone-900 hover:-translate-y-0.5 hover:border-stone-950",
    ghost: "text-stone-700 hover:text-stone-950",
  } as const;

  return (
    <Link href={href} className={cn("inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium", tones[tone], className)}>
      {children}
    </Link>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return <div className="flex items-center gap-2 text-sm text-stone-600"><LoaderCircle className="h-4 w-4 animate-spin" /> {label}</div>;
}

export function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <Card className="border-red-200 bg-red-50/60 text-red-900">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-1 h-4 w-4" />
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-red-800">{message}</p>
        </div>
      </div>
    </Card>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card className="border-dashed bg-[var(--surface-muted)]">
      <h2 className="font-semibold text-stone-900">{title}</h2>
      <p className="mt-2 text-sm text-stone-600">{message}</p>
    </Card>
  );
}

export function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14", className)}>{children}</section>;
}
