import { describe, expect, it, beforeEach } from "vitest";
import { buildCustomEvent, buildPageViewEvent } from "../events";

describe("event builders", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/products");
    process.env.NEXT_PUBLIC_APP_ENV = "test";
    process.env.NEXT_PUBLIC_APP_VERSION = "1.2.3";
  });

  it("builds a page_view event with page context", () => {
    const event = buildPageViewEvent("Products");

    expect(event.eventType).toBe("page_view");
    expect(event.web?.webPageDetails?.name).toBe("Products");
    expect(event.web?.webPageDetails?.URLPath).toBe("/products");
  });

  it("builds a custom event with provided name", () => {
    const event = buildCustomEvent("my_event", "Home");

    expect(event.eventType).toBe("custom_event");
    expect(event.web?.webPageDetails?.name).toBe("Home");
  });
});
