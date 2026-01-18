export type ConsentState = "unknown" | "granted" | "denied";

let consentState: ConsentState = "unknown";
const listeners = new Set<(state: ConsentState) => void>();

export function getConsentState(): ConsentState {
  return consentState;
}

export function setConsentState(state: ConsentState) {
  if (consentState === state) {
    return;
  }
  consentState = state;
  listeners.forEach((listener) => listener(consentState));
}

export function onConsentChange(listener: (state: ConsentState) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
