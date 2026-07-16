import { describe, expect, it } from "vitest";

import { getThemeConfig } from "@/config/theme";

describe("theme presets", () => {
  it("returns the default theme for unknown presets", () => {
    expect(getThemeConfig("unknown").brandName).toBe("Northstar Booking Kit");
  });

  it("returns alternate preset branding for clinic, meeting, and rental demos", () => {
    expect(getThemeConfig("clinic").logoText).toBe("Northstar Care");
    expect(getThemeConfig("meeting").logoText).toBe("Northstar Rooms");
    expect(getThemeConfig("rental").logoText).toBe("Northstar Fleet");
  });
});
