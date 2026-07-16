import { describe, expect, it } from "vitest";

import { formatDurationRange, humanizeValue, pricingModeLabel, statusTone } from "@/lib/presentation";

describe("presentation helpers", () => {
  it("humanizes enum-like values for interface copy", () => {
    expect(humanizeValue("fixed_slot")).toBe("Fixed slot");
    expect(humanizeValue("meeting-space")).toBe("Meeting space");
  });

  it("formats booking durations into readable ranges", () => {
    expect(formatDurationRange(60, 480)).toBe("1 hr minimum · up to 8 hr");
    expect(formatDurationRange(1440, 4320)).toBe("1 day minimum · up to 3 days");
  });

  it("maps statuses and pricing modes into stable UI labels", () => {
    expect(statusTone("confirmed")).toBe("success");
    expect(statusTone("cancelled")).toBe("danger");
    expect(statusTone("pending")).toBe("warning");
    expect(pricingModeLabel("hourly")).toBe("Per hour");
  });
});
