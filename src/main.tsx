import "./index.css";

import { PostHogProvider } from "@posthog/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

// Suppress unhandled AbortErrors originating from Supabase Realtime internals.
// These are thrown when the client aborts its own internal WebSocket/fetch connections
// (e.g. during auth state changes) and escape the Supabase client's own error handling.
// They are harmless — nothing in application code awaits these promises.
window.addEventListener("unhandledrejection", (event) => {
  if (event.reason instanceof DOMException && event.reason.name === "AbortError") {
    event.preventDefault();
  }
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
