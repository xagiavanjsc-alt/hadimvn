import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import OnboardingGate from "@/components/feature/OnboardingGate";
import { STORAGE_KEYS } from "@/lib/storageKeys";

// ── Mock useAuth so we control `user` per test ─────────────────────────────
let mockUser: { id: string } | null = null;
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser }),
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

describe("OnboardingGate", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockUser = null;
  });

  it("does nothing when user is null (anonymous browser tab)", () => {
    window.localStorage.setItem(STORAGE_KEYS.JUST_SIGNED_UP, "1");
    const { getByTestId } = renderGate("/landing");
    expect(getByTestId("loc").textContent).toBe("/landing");
    // Flag must stay set — gate runs once user authenticates
    expect(window.localStorage.getItem(STORAGE_KEYS.JUST_SIGNED_UP)).toBe("1");
  });

  it("does nothing when user is authenticated but flag is missing", () => {
    mockUser = { id: "u1" };
    const { getByTestId } = renderGate("/dashboard");
    expect(getByTestId("loc").textContent).toBe("/dashboard");
  });

  it("redirects to /onboarding and clears flag when user is authenticated AND flag is set", async () => {
    window.localStorage.setItem(STORAGE_KEYS.JUST_SIGNED_UP, "1");
    mockUser = { id: "u1" };
    const { getByTestId } = renderGate("/landing");
    await waitFor(() => {
      expect(getByTestId("loc").textContent).toBe("/onboarding");
    });
    expect(window.localStorage.getItem(STORAGE_KEYS.JUST_SIGNED_UP)).toBeNull();
  });

  it("redirect is one-shot — flag is cleared so a remount with same user does not redirect again", async () => {
    window.localStorage.setItem(STORAGE_KEYS.JUST_SIGNED_UP, "1");
    mockUser = { id: "u1" };
    const { getByTestId, unmount } = renderGate("/landing");
    await waitFor(() => {
      expect(getByTestId("loc").textContent).toBe("/onboarding");
    });
    expect(window.localStorage.getItem(STORAGE_KEYS.JUST_SIGNED_UP)).toBeNull();
    unmount();

    // Fresh mount (simulates user navigating to /dashboard, then a re-render
    // of the gate). Same user still authenticated, but flag now cleared.
    const second = renderGate("/dashboard");
    await new Promise(r => setTimeout(r, 10));
    expect(second.getByTestId("loc").textContent).toBe("/dashboard");
  });

  it("ignores flag values other than the exact string '1'", () => {
    window.localStorage.setItem(STORAGE_KEYS.JUST_SIGNED_UP, "true");
    mockUser = { id: "u1" };
    const { getByTestId } = renderGate("/landing");
    expect(getByTestId("loc").textContent).toBe("/landing");
    // Flag is not cleared either — invalid value left for inspection
    expect(window.localStorage.getItem(STORAGE_KEYS.JUST_SIGNED_UP)).toBe("true");
  });
});
