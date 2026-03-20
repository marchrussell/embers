const LOOPS_API_KEY = Deno.env.get("LOOPS_API_KEY");
const LOOPS_BASE_URL = "https://app.loops.so/api/v1";

interface LoopsContactProperties {
  userId?: string;
  subscriptionStatus?: string;
  subscriptionStartedAt?: string;
  trialEndsAt?: string;
  canceledAt?: string;
  lastActiveAt?: string;
  firstSessionCompleted?: boolean;
  onboardingCompleted?: boolean;
  pendingSetup?: boolean;
  [key: string]: string | boolean | undefined;
}

export async function upsertLoopsContact(
  email: string,
  properties: LoopsContactProperties
): Promise<void> {
  if (!LOOPS_API_KEY) {
    console.warn("[LOOPS] LOOPS_API_KEY not set, skipping contact upsert");
    return;
  }

  const response = await fetch(`${LOOPS_BASE_URL}/contacts/update`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${LOOPS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, ...properties }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[LOOPS] Failed to upsert contact", { email, error });
  } else {
    console.log("[LOOPS] Contact upserted", { email });
  }
}

export async function fireLoopsEvent(
  email: string,
  eventName: string,
  properties?: Record<string, string | boolean | number>
): Promise<void> {
  if (!LOOPS_API_KEY) {
    console.warn("[LOOPS] LOOPS_API_KEY not set, skipping event", { eventName });
    return;
  }

  const response = await fetch(`${LOOPS_BASE_URL}/events/send`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOOPS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, eventName, ...properties }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[LOOPS] Failed to fire event", { email, eventName, error });
  } else {
    console.log("[LOOPS] Event fired", { email, eventName });
  }
}
