import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthProvider, useAuth } from "@/lib/auth";

vi.mock("@/lib/api", () => ({
  authApi: {
    refresh: vi.fn().mockResolvedValue({ data: { access: "token-123" } }),
    me: vi.fn().mockResolvedValue({ data: { id: "1", email: "demo@example.com", first_name: "Demo", last_name: "User", role: "customer", is_active: true, is_verified: true, created_at: "", updated_at: "" } }),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

function Probe() {
  const { status, user } = useAuth();
  return <div>{status}:{user?.email ?? "none"}</div>;
}

describe("AuthProvider", () => {
  it("hydrates authenticated state from refresh flow", async () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByText(/authenticated:demo@example.com/i)).toBeInTheDocument());
  });
});
