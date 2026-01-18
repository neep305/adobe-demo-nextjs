type AlloyCommand = (command: string, options?: Record<string, unknown>) => Promise<unknown>;

let alloyPromise: Promise<AlloyCommand> | null = null;
let isConfigured = false;

function getGlobalAlloy(): AlloyCommand | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  const alloy = (window as unknown as { alloy?: AlloyCommand }).alloy;
  return typeof alloy === "function" ? alloy : undefined;
}

export function getAlloy(): AlloyCommand | undefined {
  return getGlobalAlloy();
}

export function initAlloy(): Promise<AlloyCommand> {
  if (alloyPromise) {
    return alloyPromise;
  }

  alloyPromise = new Promise((resolve, reject) => {
    const alloy = getGlobalAlloy();
    if (alloy) {
      resolve(alloy);
      return;
    }

    reject(new Error("Alloy is not available on window"));
  });

  return alloyPromise;
}

export async function configureAlloy() {
  if (isConfigured) {
    return;
  }

  const datastreamId = process.env.NEXT_PUBLIC_AEP_EDGE_CONFIG_ID;
  if (!datastreamId) {
    throw new Error("NEXT_PUBLIC_AEP_EDGE_CONFIG_ID is not set");
  }

  const alloy = await initAlloy();
  await alloy("configure", {
    datastreamId,
    orgId: process.env.NEXT_PUBLIC_AEP_ORG_ID,
    context: ["web", "device", "environment", "placeContext"],
    debugEnabled: process.env.NEXT_PUBLIC_AEP_DEBUG === "true",
    defaultConsent: "pending",
    targetMigrationEnabled: true,
  });
  isConfigured = true;
}
