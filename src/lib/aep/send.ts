import { initAlloy } from "./client";
import { getConsentState, onConsentChange } from "./consent";

type SendEventInput = {
  xdm: Record<string, unknown>;
  data?: Record<string, unknown>;
};

type SendResult =
  | { status: "sent" }
  | { status: "queued"; reason: "alloy_unavailable" }
  | { status: "skipped"; reason: "consent_denied" | "consent_unknown" };

const queue: SendEventInput[] = [];
let isFlushing = false;

const piiKeyPatterns = [
  "email",
  "phone",
  "telephone",
  "mobile",
  "msisdn",
  "address",
  "street",
  "city",
  "postal",
  "zip",
  "ssn",
  "passport",
  "nationalid",
  "gov",
  "ip",
  "ipv4",
  "ipv6",
  "lat",
  "latitude",
  "lon",
  "longitude",
];

const piiNameKeyPatterns = [
  "first_name",
  "last_name",
  "full_name",
  "given_name",
  "family_name",
];

const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const phoneRegex = /\+?\d[\d\s().-]{6,}\d/;
const ipv4Regex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
const ipv6Regex = /\b([a-f0-9]{1,4}:){2,7}[a-f0-9]{1,4}\b/i;

function keyLooksSensitive(key: string) {
  const lower = key.toLowerCase();
  return (
    piiKeyPatterns.some((pattern) => lower.includes(pattern)) ||
    piiNameKeyPatterns.includes(lower)
  );
}

function valueLooksSensitive(value: unknown) {
  if (typeof value !== "string") {
    return false;
  }
  return emailRegex.test(value) || phoneRegex.test(value) || ipv4Regex.test(value) || ipv6Regex.test(value);
}

function getValueAtPath(value: unknown, path: string) {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }
    return (current as Record<string, unknown>)[key];
  }, value);
}

function findSensitiveValue(
  value: unknown,
  path: string,
  depth: number
): string | null {
  if (depth > 8) {
    return null;
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      const hit = findSensitiveValue(value[i], `${path}[${i}]`, depth + 1);
      if (hit) {
        return hit;
      }
    }
    return null;
  }

  if (value && typeof value === "object") {
    for (const [key, next] of Object.entries(value as Record<string, unknown>)) {
      if (keyLooksSensitive(key)) {
        return `${path}.${key}`;
      }
      const hit = findSensitiveValue(next, `${path}.${key}`, depth + 1);
      if (hit) {
        return hit;
      }
    }
    return null;
  }

  if (valueLooksSensitive(value)) {
    return path;
  }

  return null;
}

function validatePayload(input: SendEventInput) {
  if (!input || typeof input !== "object") {
    throw new Error("sendEvent payload must be an object");
  }
  if (!input.xdm || typeof input.xdm !== "object") {
    throw new Error("sendEvent payload must include xdm");
  }
  const eventType = (input.xdm as { eventType?: unknown }).eventType;
  if (typeof eventType !== "string" || eventType.trim().length === 0) {
    throw new Error("sendEvent payload must include xdm.eventType");
  }
  const normalized = eventType.trim();
  const isSnake = /^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(normalized);
  const isKebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized);
  if (!isSnake && !isKebab) {
    throw new Error("sendEvent payload xdm.eventType must be snake_case or kebab-case");
  }

  const requiredFieldsByEvent: Record<string, string[]> = {
    page_view: ["web.webPageDetails.URLPath"],
    "cta_click": ["web.webPageDetails.name"],
    form_submit: ["web.webPageDetails.name"],
  };

  const requiredPaths = requiredFieldsByEvent[normalized];
  if (requiredPaths) {
    for (const path of requiredPaths) {
      const value = getValueAtPath(input.xdm, path);
      if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`sendEvent payload missing required field xdm.${path}`);
      }
    }
  }

  const sensitivePath = findSensitiveValue(input, "payload", 0);
  if (sensitivePath) {
    throw new Error(`sendEvent payload appears to include PII at ${sensitivePath}`);
  }
}

async function flushQueue() {
  if (isFlushing || queue.length === 0) {
    return;
  }
  isFlushing = true;
  try {
    const alloy = await initAlloy();
    while (queue.length > 0) {
      const next = queue.shift();
      if (!next) {
        continue;
      }
      await alloy("sendEvent", next);
    }
  } catch {
    // Keep queue intact if Alloy is still unavailable.
  } finally {
    isFlushing = false;
  }
}

function clearQueue() {
  queue.length = 0;
}

onConsentChange((state) => {
  if (state === "granted") {
    void flushQueue();
  }
  if (state === "denied") {
    clearQueue();
  }
});

export async function sendEvent(input: SendEventInput): Promise<SendResult> {
  const consent = getConsentState();
  if (consent === "unknown") {
    return { status: "skipped", reason: "consent_unknown" };
  }
  if (consent === "denied") {
    clearQueue();
    return { status: "skipped", reason: "consent_denied" };
  }

  validatePayload(input);

  try {
    const alloy = await initAlloy();
    await alloy("sendEvent", input);
    return { status: "sent" };
  } catch {
    queue.push(input);
    return { status: "queued", reason: "alloy_unavailable" };
  }
}
