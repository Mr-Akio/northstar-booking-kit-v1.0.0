export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

export function humanizeValue(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
}

function formatDurationUnit(totalMinutes: number): string {
  if (totalMinutes % 1440 === 0) {
    const days = totalMinutes / 1440;
    return `${days} day${days === 1 ? "" : "s"}`;
  }

  if (totalMinutes % 60 === 0) {
    const hours = totalMinutes / 60;
    return `${hours} hr`;
  }

  return `${totalMinutes} min`;
}

export function formatDurationRange(minMinutes: number, maxMinutes: number): string {
  return `${formatDurationUnit(minMinutes)} minimum · up to ${formatDurationUnit(maxMinutes)}`;
}

export function pricingModeLabel(mode: string): string {
  switch (mode) {
    case "hourly":
      return "Per hour";
    case "daily":
      return "Per day";
    default:
      return "Per booking";
  }
}

export function statusTone(status: string): BadgeTone {
  switch (status) {
    case "confirmed":
    case "completed":
    case "published":
    case "verified":
      return "success";
    case "pending":
    case "draft":
      return "warning";
    case "cancelled":
    case "rejected":
    case "archived":
      return "danger";
    default:
      return "neutral";
  }
}
