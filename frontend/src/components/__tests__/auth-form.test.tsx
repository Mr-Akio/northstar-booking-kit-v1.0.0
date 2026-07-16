import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth-form";
import { ApiError } from "@/lib/api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const loginMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ login: loginMock }),
}));

describe("LoginForm", () => {
  it("shows validation messages when submitted empty", async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it("shows a server error when login fails", async () => {
    loginMock.mockRejectedValueOnce(new ApiError({ code: "invalid_credentials", message: "Invalid email or password.", fields: {} }));

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "customer@northstar.local" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "WrongPass123!" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });
});
