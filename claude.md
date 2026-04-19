# Embers Studio

A React + TypeScript + Vite web app for Embers Studio — a breathwork platform offering online experiences, access to guided sessions and live sessions.

## Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix UI), Zod validation
- **Backend**: Supabase (auth, database, edge functions)
- **Routing**: React Router v6
- **State/Data**: TanStack Query
- **Video**: Daily.co (live sessions)
- **Analytics**: PostHog
- **Deployment**: Vercel
- **Package manager**: pnpm

## Project Structure

```
src/
  pages/
    app/        # Authenticated app pages (Library, ClassPlayer, Online, etc.)
    landing/    # Marketing landing pages
    admin/      # Admin-only pages
  components/   # Shared UI components
  hooks/        # Custom React hooks
  contexts/     # React context providers
  integrations/ # Supabase client + generated types
  lib/          # Utilities
supabase/
  migrations/   # DB migrations
  functions/    # Edge functions
```

## Data Fetching

Use **TanStack Query (`useQuery` or `useSuspenseQuery`)** for all data fetching — not `useEffect` + `useState`.

- Query keys: `['resource', userId]` (e.g. `['profile', user.id]`, `['profile-stats', user.id]`)
- Gate queries with `enabled: !!user?.id` so they don't run before auth is confirmed
- Prefer `useQuery` over manual loading state — it handles caching (10min stale, 30min cache), deduplication, and eliminates loading flicker on revisit
- Only use `useEffect` for side effects that are not data fetching (e.g. redirects, event listeners)

## Mobile Optimisation

This is a **mobile-first** product. Prioritise mobile experience in all UI work:

- Use responsive Tailwind classes in order: base (mobile) → `md:` → `lg:`
- Touch targets must be at least 44×44px (use `min-h-[44px]` or `py-3`+)
- Prefer `100dvh` over `100vh` to handle mobile browser chrome correctly
- Test layout at 375px width first, then scale up
- Avoid hover-only interactions — ensure tap/touch equivalents exist
- Font sizes: use `clamp()` or responsive text classes rather than fixed sizes

## Edge Functions

Every edge function must have a `[functions.<name>]` entry in `supabase/config.toml` with `verify_jwt = false`. Functions handle auth internally. Omitting this entry causes Supabase's edge runtime to reject ES256 JWTs before the function code runs (`401 UNAUTHORIZED_UNSUPPORTED_TOKEN_ALGORITHM`, `execution_id: null` in logs).

```toml
[functions.my-function]
verify_jwt = false
```

Deploy with: `supabase functions deploy <function-name>`

## Dev Commands

```bash
pnpm dev          # Start dev server
pnpm build        # TypeScript check + Vite build
pnpm lint         # ESLint
```