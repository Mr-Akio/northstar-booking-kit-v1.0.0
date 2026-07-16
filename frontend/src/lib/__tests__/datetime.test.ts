import { describe, expect, it } from "vitest";

import { datetimeLocalToUtcIso } from "@/lib/datetime";

describe("datetimeLocalToUtcIso", () => {
  it("preserves the selected wall-clock time when converting datetime-local input to UTC", () => {
    expect(datetimeLocalToUtcIso("2026-07-17T10:00")).toBe("2026-07-17T10:00:00.000Z");
    expect(datetimeLocalToUtcIso("2026-07-17T12:30")).toBe("2026-07-17T12:30:00.000Z");
  });
});
