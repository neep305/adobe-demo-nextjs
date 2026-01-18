import {
  buildCtaClickEvent,
  buildCustomEvent,
  buildFormSubmitEvent,
  buildPageViewEvent,
  sendEvent,
} from "../aep";

export type TrackEventName = "page_view" | "cta_click" | "form_submit" | "custom_event";

type TrackPayload = {
  name?: string;
  pageName?: string;
};

export async function track(eventName: TrackEventName, payload: TrackPayload = {}) {
  switch (eventName) {
    case "page_view":
      return sendEvent({ xdm: buildPageViewEvent(payload.pageName) });
    case "cta_click":
      return sendEvent({ xdm: buildCtaClickEvent(payload.name) });
    case "form_submit":
      return sendEvent({ xdm: buildFormSubmitEvent(payload.name) });
    case "custom_event":
    default:
      return sendEvent({ xdm: buildCustomEvent(payload.name || "custom_event", payload.pageName) });
  }
}
