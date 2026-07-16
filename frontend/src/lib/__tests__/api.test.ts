import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiFetch } from "@/lib/api";

describe("apiFetch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed payload for successful requests", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: { ok: true } }) }));
    const response = await apiFetch<{ data: { ok: boolean } }>("/api/test/");
    expect(response.data.ok).toBe(true);
  });

  it("throws ApiError for backend error envelopes", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: { code: "booking_conflict", message: "Slot unavailable", fields: {} } }) }));
    await expect(apiFetch("/api/test/")).rejects.toBeInstanceOf(ApiError);
  });
});
