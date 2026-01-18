export type EventName = "page_view" | "cta_click" | "form_submit" | "custom_event";

export type BaseEventPayload = {
  eventName: EventName;
  page?: {
    url?: string;
    path?: string;
    referrer?: string;
    name?: string;
  };
  app?: {
    env?: string;
    version?: string;
  };
};

export type XdmEvent = {
  eventType: string;
  web?: {
    webPageDetails?: {
      name?: string;
      URL?: string;
      URLPath?: string;
      referrer?: string;
    };
  };
  _app?: {
    env?: string;
    version?: string;
  };
};

function getPageContext(): BaseEventPayload["page"] {
  if (typeof window === "undefined") {
    return undefined;
  }

  return {
    url: window.location.href,
    path: window.location.pathname,
    referrer: document.referrer || undefined,
  };
}

function getAppContext(): BaseEventPayload["app"] {
  return {
    env: process.env.NEXT_PUBLIC_APP_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION,
  };
}

function buildXdm(payload: BaseEventPayload): XdmEvent {
  return {
    eventType: payload.eventName,
    web: payload.page
      ? {
          webPageDetails: {
            name: payload.page.name,
            URL: payload.page.url,
            URLPath: payload.page.path,
            referrer: payload.page.referrer,
          },
        }
      : undefined,
    _app: payload.app ? { env: payload.app.env, version: payload.app.version } : undefined,
  };
}

export function buildPageViewEvent(name?: string) {
  const payload: BaseEventPayload = {
    eventName: "page_view",
    page: { ...getPageContext(), name },
    app: getAppContext(),
  };

  return buildXdm(payload);
}

export function buildCtaClickEvent(name?: string) {
  const payload: BaseEventPayload = {
    eventName: "cta_click",
    page: { ...getPageContext(), name },
    app: getAppContext(),
  };

  return buildXdm(payload);
}

export function buildFormSubmitEvent(name?: string) {
  const payload: BaseEventPayload = {
    eventName: "form_submit",
    page: { ...getPageContext(), name },
    app: getAppContext(),
  };

  return buildXdm(payload);
}

export function buildCustomEvent(name: string, pageName?: string) {
  const payload: BaseEventPayload = {
    eventName: "custom_event",
    page: { ...getPageContext(), name: pageName },
    app: getAppContext(),
  };

  return buildXdm(payload);
}
