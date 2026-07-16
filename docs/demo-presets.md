# Demo Presets

Northstar Booking Kit supports lightweight frontend branding presets through `NEXT_PUBLIC_THEME_PRESET`.

## Available presets

### `default`
- Positioning: neutral reusable booking starter
- Best for: mixed demos, generic sales screenshots, agency packaging
- Brand surface: `Northstar Booking Kit`

### `clinic`
- Positioning: consultations, providers, treatment rooms, outpatient scheduling
- Best for: medical-adjacent, wellness, or appointment-heavy demos
- Brand surface: `Northstar Care Kit`

### `meeting`
- Positioning: rooms, workspaces, meeting suites, internal reservations
- Best for: B2B operations, workspace booking, venue-lite demos
- Brand surface: `Northstar Rooms Kit`

### `rental`
- Positioning: vehicles, equipment, studios, inventory, and other rentable assets
- Best for: rental-heavy demos, fleet booking, equipment reservation, studio hire
- Brand surface: `Northstar Fleet Kit`

## How to switch presets

Set the frontend environment variable before running the app:

```bash
NEXT_PUBLIC_THEME_PRESET=clinic
```

or

```bash
NEXT_PUBLIC_THEME_PRESET=meeting
```

or

```bash
NEXT_PUBLIC_THEME_PRESET=rental
```

If the value is missing or unknown, the frontend falls back to `default`.

## What changes with a preset

- Brand name
- Logo text
- Accent colors
- Support label
- Footer statement
- Contact information
- Booking terminology labels

## What does not change

- Backend business rules
- API behavior
- Booking conflict prevention
- Permissions
- Migrations
- Seed data structure

Presets are intentionally shallow. They help a buyer see how the starter can be repositioned without forcing a forked codebase.
