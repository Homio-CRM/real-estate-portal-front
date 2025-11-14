# Style and Conventions
- **Language**: TypeScript throughout; leverage Supabase-generated types (`types/database.ts`) for data models.
- **Framework**: Next.js App Router patterns (server components, route handlers under `app/api`).
- **Styling**: TailwindCSS utility classes with `tailwind-merge` helpers; avoid inline styles when utilities exist.
- **Linting**: ESLint Flat Config extending `next/core-web-vitals` and `next/typescript`; run `npm run lint` before shipping.
- **Components**: Function components, React hooks for state/effects; prefer typed props/interfaces.
- **Formatting**: Follow default ESLint/Next formatting (no Prettier config observed).