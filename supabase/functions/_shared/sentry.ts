const SENTRY_DSN = Deno.env.get("SENTRY_DSN");

function parseDsn(dsn: string): { key: string; host: string; projectId: string } | null {
  try {
    const url = new URL(dsn);
    return {
      key: url.username,
      host: url.host,
      projectId: url.pathname.slice(1),
    };
  } catch {
    return null;
  }
}

async function sendToSentry(payload: Record<string, unknown>): Promise<void> {
  if (!SENTRY_DSN) return;
  const parsed = parseDsn(SENTRY_DSN);
  if (!parsed) return;
  const { key, host, projectId } = parsed;
  await fetch(`https://${host}/api/${projectId}/store/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sentry-Auth": `Sentry sentry_version=7,sentry_key=${key}`,
    },
    body: JSON.stringify({
      event_id: crypto.randomUUID().replace(/-/g, ""),
      timestamp: new Date().toISOString(),
      ...payload,
    }),
  }).catch(() => {});
}

export async function captureException(error: unknown, context?: Record<string, unknown>): Promise<void> {
  const err = error instanceof Error ? error : new Error(String(error));
  await sendToSentry({
    level: "error",
    exception: {
      values: [{ type: err.name, value: err.message }],
    },
    extra: context,
  });
}

export async function captureMessage(
  message: string,
  level: "warning" | "error" = "error",
  context?: Record<string, unknown>
): Promise<void> {
  await sendToSentry({
    level,
    message: { formatted: message },
    extra: context,
  });
}
