export type ThemePresetKey = "default" | "clinic" | "meeting" | "rental";

const themePresets = {
  default: {
    brandName: "Northstar Booking Kit",
    logoText: "Northstar",
    accentColor: "#285446",
    accentSoftColor: "#dce8e2",
    surfaceTintColor: "#f3efe8",
    supportLabel: "Configurable booking operations starter",
    footerStatement: "A neutral booking reference product for spaces, services, staff, and time-slot operations.",
    contactEmail: "hello@northstar.local",
    contactPhone: "+1 (555) 010-1010",
    defaultCurrency: "USD",
    dateFormat: "MMM d, yyyy · HH:mm",
    terminology: {
      resource: "resource",
      resources: "resources",
      booking: "booking",
      bookings: "bookings",
      staff: "staff",
    },
  },
  clinic: {
    brandName: "Northstar Care Kit",
    logoText: "Northstar Care",
    accentColor: "#1f6f67",
    accentSoftColor: "#d7ebe7",
    surfaceTintColor: "#eef6f4",
    supportLabel: "Outpatient scheduling starter",
    footerStatement: "A scheduling reference product for clinics, consultations, treatment rooms, and healthcare-adjacent services.",
    contactEmail: "care@northstar.local",
    contactPhone: "+1 (555) 010-2200",
    defaultCurrency: "USD",
    dateFormat: "MMM d, yyyy · HH:mm",
    terminology: {
      resource: "provider",
      resources: "providers",
      booking: "appointment",
      bookings: "appointments",
      staff: "staff",
    },
  },
  meeting: {
    brandName: "Northstar Rooms Kit",
    logoText: "Northstar Rooms",
    accentColor: "#35598a",
    accentSoftColor: "#dbe4f2",
    surfaceTintColor: "#f1f5fa",
    supportLabel: "Workspace and room reservation starter",
    footerStatement: "A reservation reference product for meeting rooms, event spaces, desks, and operational calendars.",
    contactEmail: "rooms@northstar.local",
    contactPhone: "+1 (555) 010-3300",
    defaultCurrency: "USD",
    dateFormat: "MMM d, yyyy · HH:mm",
    terminology: {
      resource: "room",
      resources: "rooms",
      booking: "reservation",
      bookings: "reservations",
      staff: "coordinator",
    },
  },
  rental: {
    brandName: "Northstar Fleet Kit",
    logoText: "Northstar Fleet",
    accentColor: "#8b5a2b",
    accentSoftColor: "#eee0d2",
    surfaceTintColor: "#f5f0e8",
    supportLabel: "Rental inventory booking starter",
    footerStatement: "A booking reference product for rentals, vehicles, equipment, studios, and inventory-based reservations.",
    contactEmail: "fleet@northstar.local",
    contactPhone: "+1 (555) 010-4400",
    defaultCurrency: "USD",
    dateFormat: "MMM d, yyyy · HH:mm",
    terminology: {
      resource: "asset",
      resources: "assets",
      booking: "reservation",
      bookings: "reservations",
      staff: "operator",
    },
  },
} as const;

export function getThemeConfig(preset: string | undefined) {
  if (!preset) {
    return themePresets.default;
  }

  const normalized = preset.toLowerCase() as ThemePresetKey;
  return themePresets[normalized] ?? themePresets.default;
}

export const availableThemePresets = Object.keys(themePresets) as ThemePresetKey[];

export const themeConfig = getThemeConfig(process.env.NEXT_PUBLIC_THEME_PRESET);
