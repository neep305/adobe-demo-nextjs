import { describe, expect, it } from "vitest";
import { getConsentState, onConsentChange, setConsentState } from "../consent";

describe("consent state", () => {
  it("defaults to unknown", () => {
    expect(getConsentState()).toBe("unknown");
  });

  it("notifies listeners on state change", () => {
    const events: string[] = [];
    const unsubscribe = onConsentChange((state) => events.push(state));

    setConsentState("granted");
    setConsentState("denied");

    unsubscribe();

    expect(events).toEqual(["granted", "denied"]);
  });
});
