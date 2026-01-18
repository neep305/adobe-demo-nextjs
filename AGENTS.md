# AGENTS.md
> This repository uses Next.js and Adobe Experience Platform Web SDK.
> Follow this file as the single source of truth for coding-agent behavior.

## 0) Mission
- Build a production-grade Next.js application with Adobe Experience Platform (AEP) Web SDK integration.
- Ensure tracking is correct, consent-compliant, and does not degrade performance (Core Web Vitals).
- Keep business logic, analytics logic, and UI concerns separated.

## 1) Tech Stack
- Next.js (App Router by default unless explicitly stated otherwise)
- TypeScript
- Adobe Experience Platform Web SDK (a.k.a. Alloy)
  - Edge Network sendEvent
  - Data Collection Tags may exist, but prefer direct Web SDK integration unless project explicitly uses Launch.
- Consent Management (CMP) may be integrated (e.g., OneTrust). Do not bypass consent.

## 2) Non-Negotiables (Hard Rules)
### 2.1 Privacy & Consent
- NEVER send tracking/events before user consent is granted (if consent is required in the region/business rules).
- Always route event sending through a single consent-aware gateway function.
- Do not log or store PII in the browser or in server logs.
- If a payload might include PII (email, phone, name, identifiers), strip or hash according to defined policy.
- Do not add new identifiers or fingerprinting logic.

### 2.2 Performance
- Do not block initial render for SDK initialization.
- Use lazy initialization and queue events until SDK is ready **only after consent**.
- Avoid large client bundles: isolate AEP code into a small module and import it dynamically if needed.
- Do not add heavy dependencies without justification.

### 2.3 Architecture
- Keep AEP integration as an infra layer:
  - `lib/aep/*` owns initialization, consent gating, and event sending.
  - UI components must not call Alloy directly.
- Prefer typed event schemas (TypeScript types) for all tracking events.

### 2.4 Next.js Rules
- App Router:
  - Use `"use client"` only where required.
  - Never access `window` in Server Components.
- Server-side:
  - Do not send AEP Web SDK events from the server unless explicitly required and designed (AEP Web SDK is primarily client-side).
- No secret values in client code. All env usage must be reviewed:
  - `NEXT_PUBLIC_*` is client-exposed.

## 3) Repository Structure (Recommended)
> If current repo differs, follow existing structure but preserve ownership boundaries.

- `src/lib/aep/`
  - `client.ts`            # createAlloy / getAlloy instance
  - `consent.ts`           # consent status + gate logic
  - `events.ts`            # typed event builders
  - `send.ts`              # consent-aware sendEvent wrapper
  - `index.ts`             # public API for app usage
- `src/lib/analytics/`
  - `track.ts`             # app-level track(eventName, payload) -> uses lib/aep
- `src/app/`
  - `layout.tsx`           # app shell; only minimal init hooks (client boundary)
  - `providers.tsx`        # optional: consent provider, analytics provider
- `src/components/`
  - UI only; calls `track()` or uses hooks, never Alloy directly

## 4) Adobe Experience Platform Web SDK Integration Rules
### 4.1 Initialization
- Alloy should be initialized in a single place.
- Configuration must come from environment variables:
  - `NEXT_PUBLIC_AEP_EDGE_CONFIG_ID` (datastream / edge config)
  - `NEXT_PUBLIC_AEP_ORG_ID` (if needed)
  - Optional: debug flags (must default OFF)
- Initialization must be idempotent (safe to call multiple times).

### 4.2 Event Sending
- All event sending must go through:
  - `sendEvent()` wrapper in `src/lib/aep/send.ts`
- Wrapper responsibilities:
  - Check consent state
  - Ensure Alloy initialized (or lazy init)
  - Validate event payload (basic shape + required fields)
  - Optional: apply common XDM fields (e.g., timestamp, app info)

### 4.3 XDM & Data Model
- Prefer building a minimal, consistent XDM structure.
- Maintain typed builders in `events.ts`.
- Do not invent new XDM schemas without coordinating with AEP schema definitions.
- If schema details are unknown, create a TODO and implement minimal safe fields.

### 4.4 Debugging
- Debug must be controlled by env flag:
  - `NEXT_PUBLIC_AEP_DEBUG=true` (optional)
- Do not print full payloads in console in production.
- If logging is needed, redact sensitive fields.

## 5) Consent Handling
### 5.1 Consent Sources
- If CMP exists:
  - read consent from CMP API or consent cookie (documented in code)
- If CMP does not exist:
  - implement a minimal consent state in app (opt-in gate)

### 5.2 Consent States
Define normalized states:
- `unknown` (default)
- `granted`
- `denied`

Rules:
- If `unknown`, do not send anything.
- If `denied`, do not send anything and clear queued events.
- If `granted`, allow sending and flush queued events.

### 5.3 Queueing
- Queue events ONLY if consent is granted but Alloy is not ready yet.
- Never queue events while consent is unknown/denied.

## 6) Event Taxonomy (Tracking Contract)
### 6.1 Naming
- Use `snake_case` or `kebab-case` consistently (follow existing convention).
- Include `eventType` consistent with AEP expectations (if defined).

### 6.2 Required Baseline Fields
Each event should include:
- `eventName`
- `page` context (url, path, referrer where allowed)
- `app` context (env, version if available)

### 6.3 Common Events
Examples:
- `page_view`
- `cta_click`
- `form_submit`
- `purchase` (only if e-commerce data model exists)

## 7) Testing & Validation
- Unit tests for:
  - consent gating logic
  - event builder output shapes
  - send wrapper behavior (mock Alloy)
- E2E smoke tests (optional):
  - verify that events do not fire before consent
  - verify that events fire after consent

## 8) Security & PII Policy
- Never include:
  - email, phone, name, address, government IDs, full IP, precise location
- If business requires identity:
  - use approved hashed identifiers only (policy must be defined elsewhere)
- Do not introduce new cookies or localStorage items for tracking without approval.

## 9) PR / Code Change Rules (for coding agents)
- Prefer modifying existing modules over introducing new patterns.
- Any new public API must be documented in `src/lib/aep/index.ts`.
- Keep changes minimal and localized.
- Update or add tests for new behavior.
- If uncertain about AEP schema fields:
  - implement minimal safe fields and add TODO with context.

## 10) Examples (Good vs Bad)
### Good
- UI -> `track("cta_click", {...})` -> `lib/analytics/track.ts` -> `lib/aep/send.ts`
- Consent gating in one place
- Typed event builder per event type

### Bad
- UI imports `@adobe/alloy` directly
- Sending events from Server Components
- Sending events before consent
- Logging raw payloads in production console

## 11) Quick Start Guidance (for agents)
When asked to add a new tracking event:
1. Add a typed builder in `src/lib/aep/events.ts`
2. Extend `src/lib/analytics/track.ts` to accept the event + payload
3. Call `track()` from UI at the right interaction point
4. Add tests for builder and consent gating behavior
