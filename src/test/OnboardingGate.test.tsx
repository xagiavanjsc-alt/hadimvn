import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import OnboardingGate from "@/components/feature/OnboardingGate";

// ── Mock useAuth so we control user/profile per test ───────────────────────
type MockState = {
  user: { id: string } | null;
  profile: { id: string; onboarded_at: string | null } | null;
};
let mockAuth: MockState = { user: null, profile: null };
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockAuth,
}));

function LocationProbe() {
  const loc = useLocation();
  return <span data-testid="loc">{loc.pathname}</span>;
}

function renderGate(initialPath = "/landing") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <OnboardingGate />
      <LocationProbe />
    </MemoryRouter>
  );
}

describe("OnboardingGate (DB-driven)", () => {
  beforeEach(() => {
    mockAuth = { user: null, profile: null };
  });

  it("does nothing when user is null (anonymous tab)", () => {
    const { getByTestId } = renderGate("/landing");
    expect(getByTestId("loc").textContent).toBe("/landing");
  });

  it("does nothing when user is set but profile has not loaded yet", () => {
    mockAuth = { user: { id: "u1" }, profile: null };
    const { getByTestId } = renderGate("/dashboard");
    expect(getByTestId("loc").textContent).toBe("/dashboard");
  });

  it("does nothing when profile.onboarded_at is set (existing user)", () => {
    mockAuth = {
      user: { id: "u1" },
      profile: { id: "u1", onboarded_at: "2025-01-01T00:00:00Z" },
    };
    const { getByTestId } = renderGate("/dashboard");
    expect(getByTestId("loc").textContent).toBe("/dashboard");
  });

  it("redirects to /onboarding when profile.onboarded_at is null (new signup)", async () => {
    mockAuth = {
      user: { id: "u1" },
      profile: { id: "u1", onboarded_at: null },
    };
    const { getByTestId } = renderGate("/landing");
    await waitFor(() => {
      expect(getByTestId("loc").textContent).toBe("/onboarding");
    });
  });

  it("does NOT redirect when already on /onboarding (loop guard)", async () => {
    mockAuth = {
      user: { id: "u1" },
      profile: { id: "u1", onboarded_at: null },
    };
    const { getByTestId } = renderGate("/onboarding");
    await new Promise(r => setTimeout(r, 10));
    expect(getByTestId("loc").textContent).toBe("/onboarding");
  });

  it("stops redirecting once profile updates with onboarded_at after completion", async () => {
    // First mount: profile says not-yet-onboarded → gate redirects.
    mockAuth = {
      user: { id: "u1" },
      profile: { id: "u1", onboarded_at: null },
    };
    const first = renderGate("/landing");
    await waitFor(() => {
      expect(first.getByTestId("loc").textContent).toBe("/onboarding");
    });
    first.unmount();

    // Simulate: user finishes the quiz, refreshProfile() runs, profile now has
    // onboarded_at set. A subsequent navigation must not pull them back.
    mockAuth = {
      user: { id: "u1" },
      profile: { id: "u1", onboarded_at: new Date().toISOString() },
    };
    const second = renderGate("/eps-lessons");
    await new Promise(r => setTimeout(r, 10));
    expect(second.getByTestId("loc").textContent).toBe("/eps-lessons");
  });
});
