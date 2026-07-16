# Commercial UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition the frontend from a functional demo into a commercial-grade reference product for a reusable booking starter kit.

**Architecture:** Keep backend behavior unchanged and focus on a stronger presentation layer: shared visual tokens, reusable UI primitives, more intentional hierarchy on public pages, and more operational admin/customer surfaces. Preserve the generic booking domain and keep business logic in backend services.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, React Query, React Hook Form, Vitest, Playwright

## Global Constraints

- Keep the domain generic; do not reintroduce travel-specific naming.
- Preserve the split between `frontend/` and `backend/`.
- Keep business rules in backend services, not in React components.
- Do not commit real secrets, media uploads, local DB files, or demo credentials beyond the documented demo accounts.
- Update docs when changing auth, booking rules, pricing, or deployment behavior.

---

### Task 1: Presentation helpers and visual contract

**Files:**
- Create: `frontend/src/lib/presentation.ts`
- Create: `frontend/src/lib/__tests__/presentation.test.ts`

- [ ] Add test coverage for humanized labels, duration display, and status badge mapping.
- [ ] Implement the minimal formatting helpers used by redesigned pages.
- [ ] Verify the focused test file passes.

### Task 2: Shared design system refresh

**Files:**
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/src/components/ui.tsx`
- Modify: `frontend/src/components/app-shell.tsx`
- Modify: `frontend/src/config/theme.ts`

- [ ] Introduce stronger neutral tokens, structured surfaces, and reusable badges/stat cards.
- [ ] Refresh header/footer/navigation so the app feels like a configurable product shell.
- [ ] Keep the branding surface centralized in theme config.

### Task 3: Public-facing reference product pages

**Files:**
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/app/resources/page.tsx`
- Modify: `frontend/src/app/resources/[slug]/page.tsx`
- Modify: `frontend/src/app/dashboard/page.tsx`
- Modify: `frontend/src/app/bookings/page.tsx`

- [ ] Redesign the public journey with better information hierarchy, trust, and conversion cues.
- [ ] Make resource browsing and detail pages feel product-grade and reusable across business types.
- [ ] Bring customer workspace pages closer to a real booking console.

### Task 4: Operator/admin surfaces

**Files:**
- Modify: `frontend/src/app/admin/page.tsx`
- Modify: `frontend/src/app/admin/bookings/page.tsx`
- Modify: `frontend/src/app/admin/resources/page.tsx`

- [ ] Replace placeholder-style cards with operational summaries, clearer queues, and stronger row layouts.
- [ ] Keep all copy generic and starter-kit friendly.

### Task 5: Documentation and verification

**Files:**
- Modify: `docs/customization.md`

- [ ] Document the stronger theme/configuration surface for branding and presentation.
- [ ] Run `cmd /c npm run test`, `cmd /c npm run lint`, `cmd /c npm run typecheck`, and `cmd /c npm run build`.

