import { describe, expect, it, vi, beforeEach } from "vitest";
import { sendEvent } from "../send";
import { setConsentState } from "../consent";

const initAlloy = vi.fn();

vi.mock("../client", () => ({
  initAlloy: () => initAlloy(),
}));

describe("sendEvent", () => {
  beforeEach(() => {
    initAlloy.mockReset();
    setConsentState("unknown");
  });

  it("skips when consent is unknown", async () => {
    const result = await sendEvent({ xdm: { eventType: "page_view" } });

    expect(result).toEqual({ status: "skipped", reason: "consent_unknown" });
    expect(initAlloy).not.toHaveBeenCalled();
  });

  it("skips when consent is denied", async () => {
    setConsentState("denied");
    const result = await sendEvent({ xdm: { eventType: "page_view" } });

    expect(result).toEqual({ status: "skipped", reason: "consent_denied" });
    expect(initAlloy).not.toHaveBeenCalled();
  });

  it("sends when consent is granted and alloy is available", async () => {
    const send = vi.fn();
    initAlloy.mockResolvedValue(send);
    setConsentState("granted");

    const result = await sendEvent({
      xdm: { eventType: "page_view", web: { webPageDetails: { URLPath: "/home" } } },
    });

    expect(result).toEqual({ status: "sent" });
    expect(send).toHaveBeenCalledWith("sendEvent", {
      xdm: { eventType: "page_view", web: { webPageDetails: { URLPath: "/home" } } },
    });
  });

  it("rejects payloads with sensitive keys", async () => {
    setConsentState("granted");

    await expect(
      sendEvent({
        xdm: { eventType: "page_view", web: { webPageDetails: { URLPath: "/home" } } },
        data: { email: "user@example.com" },
      })
    ).rejects.toThrow(/PII/);
  });

  it("rejects payloads with sensitive values", async () => {
    setConsentState("granted");

    await expect(
      sendEvent({
        xdm: { eventType: "page_view", web: { webPageDetails: { URLPath: "/home" } } },
        data: { note: "reach me at user@example.com" },
      })
    ).rejects.toThrow(/PII/);
  });

  it("rejects missing required fields for known events", async () => {
    setConsentState("granted");

    await expect(
      sendEvent({ xdm: { eventType: "page_view" } })
    ).rejects.toThrow(/required field/);
  });
});
