# Embers Studio

A React + TypeScript + Vite web app for Embers Studio — a breathwork platform offering online experiences, access to guided sessions and live sessions.

## Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix UI)
- **Backend**: Supabase (auth, database, edge functions)
- **Routing**: React Router v6
- **State/Data**: TanStack Query
- **Video**: Daily.co (live sessions), Vimeo/YouTube (recorded)
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

## Dev Commands

```bash
pnpm dev          # Start dev server
pnpm build        # TypeScript check + Vite build
pnpm lint         # ESLint
```