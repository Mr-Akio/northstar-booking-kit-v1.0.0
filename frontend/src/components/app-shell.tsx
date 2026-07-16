"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Shield, UserCircle2, X } from "lucide-react";

import { availableThemePresets, themeConfig } from "@/config/theme";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const { user, status, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/resources", label: "Resources" },
    { href: "/dashboard", label: "Workspace" },
    { href: "/bookings", label: "My bookings" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[rgba(251,248,243,0.88)] backdrop-blur-xl">
      <div className="border-b border-[color:var(--border)] bg-[rgba(255,255,255,0.5)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-xs uppercase tracking-[0.2em] text-stone-500 sm:px-6 lg:px-8">
          <span>{themeConfig.supportLabel}</span>
          <span className="hidden sm:inline">Preset-ready · {availableThemePresets.join(" · ")}</span>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-4 text-stone-900">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[color:var(--border-strong)] bg-stone-950 text-sm font-semibold text-stone-50 shadow-[0_12px_32px_rgba(28,25,23,0.12)]">
              NS
            </div>
            <div>
              <p className="font-serif text-xl">{themeConfig.logoText}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Commercial booking starter</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full border border-[color:var(--border)] bg-white/92 p-1.5 shadow-[var(--shadow-soft)] md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm text-stone-600 hover:text-stone-950",
                  pathname === link.href && "bg-[var(--accent-soft)] text-stone-950",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {status === "authenticated" && user ? (
              <>
                <div className="text-right">
                  <p className="text-sm font-medium text-stone-900">{user.first_name} {user.last_name}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{user.role}</p>
                </div>
                <Link href="/profile" className="rounded-full border border-[color:var(--border)] bg-white p-3 text-stone-700 hover:-translate-y-0.5 hover:border-stone-950 hover:text-stone-950"><UserCircle2 className="h-4 w-4" /></Link>
                {(user.role === "staff" || user.role === "admin") && <Link href="/admin" className="rounded-full border border-[color:var(--border)] bg-white p-3 text-stone-700 hover:-translate-y-0.5 hover:border-stone-950 hover:text-stone-950"><Shield className="h-4 w-4" /></Link>}
                <button type="button" onClick={() => void logout()} className="rounded-full border border-[color:var(--border)] bg-white p-3 text-stone-700 hover:-translate-y-0.5 hover:border-stone-950 hover:text-stone-950"><LogOut className="h-4 w-4" /></button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2.5 text-sm text-stone-700 hover:-translate-y-0.5 hover:border-stone-950 hover:text-stone-950">Log in</Link>
                <Link href="/register" className="rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm text-white shadow-[var(--shadow-lift)] hover:-translate-y-0.5 hover:bg-stone-950">Start with demo data</Link>
              </div>
            )}
          </div>

          <button type="button" className="rounded-full border border-[color:var(--border)] bg-white p-3 text-stone-700 md:hidden" onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle navigation">
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="mt-4 rounded-[1.5rem] border border-[color:var(--border)] bg-white p-4 shadow-[var(--shadow-soft)] md:hidden">
            <nav className="grid gap-2">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className={cn("rounded-2xl px-4 py-3 text-sm text-stone-700", pathname === link.href && "bg-[var(--accent-soft)] text-stone-950")} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
              {status === "authenticated" ? (
                <>
                  <Link href="/profile" className="rounded-2xl px-4 py-3 text-sm text-stone-700" onClick={() => setMobileOpen(false)}>Profile</Link>
                  {(user?.role === "staff" || user?.role === "admin") ? <Link href="/admin" className="rounded-2xl px-4 py-3 text-sm text-stone-700" onClick={() => setMobileOpen(false)}>Admin</Link> : null}
                  <button type="button" onClick={() => void logout()} className="rounded-2xl px-4 py-3 text-left text-sm text-stone-700">Log out</button>
                </>
              ) : (
                <div className="grid gap-2 pt-3">
                  <Link href="/login" className="rounded-full border border-[color:var(--border)] px-4 py-3 text-center text-sm text-stone-700" onClick={() => setMobileOpen(false)}>Log in</Link>
                  <Link href="/register" className="rounded-full bg-[var(--accent)] px-4 py-3 text-center text-sm text-white" onClick={() => setMobileOpen(false)}>Create account</Link>
                </div>
              )}
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const themeStyle = {
    "--accent": themeConfig.accentColor,
    "--accent-soft": themeConfig.accentSoftColor,
    "--surface": themeConfig.surfaceTintColor,
  } as CSSProperties;

  return (
    <div className="min-h-screen bg-[var(--surface)] text-stone-900" style={themeStyle}>
      <SiteHeader />
      <main>{children}</main>
      <footer className="border-t border-[color:var(--border)] bg-[rgba(255,255,255,0.62)] px-4 py-10 text-sm text-stone-600 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div className="space-y-3">
            <p className="font-serif text-2xl text-stone-950">{themeConfig.brandName}</p>
            <p className="max-w-2xl leading-6">{themeConfig.footerStatement}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {availableThemePresets.map((preset) => (
                <span key={preset} className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-500">
                  {preset}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-2 md:text-right">
            <p>{themeConfig.contactEmail}</p>
            <p>{themeConfig.contactPhone}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
