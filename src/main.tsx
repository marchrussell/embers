import "./index.css";

import { PostHogProvider } from "@posthog/react";
import * as Sentry from "@sentry/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enabled: import.meta.env.PROD,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Suppress harmless AbortErrors from Supabase Realtime internals
    const error = hint?.originalException;
    if (error instanceof DOMException && error.name === "AbortError") return null;
    return event;
  },
});

window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string;
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider
      apiKey={POSTHOG_KEY}
      options={{ api_host: POSTHOG_HOST, person_profiles: "identified_only" }}
    >
      <App />
    </PostHogProvider>
  </StrictMode>
);
