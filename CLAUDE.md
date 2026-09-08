# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Futsal match cost-splitting app ("Penalty Merchants", deployed at penalty-merchants.vercel.app). Admins create matches, settle costs across participants (+ guests), and approve fund top-up requests; users see their balance/transactions and request funds. Next.js 15 App Router, React 19, Prisma + PostgreSQL (Neon), NextAuth (Google only), Tailwind v4, shadcn/ui config (new-york style). Package manager is **pnpm**.

## Commands

- `pnpm dev` — dev server (Turbopack)
- `pnpm build` — production build (Turbopack); also the closest thing to a typecheck gate
- `pnpm lint` — ESLint
- `pnpm prisma migrate dev` — create/apply migrations locally; `pnpm run migrate:deploy` for prod
- `pnpm prisma generate` — regenerate client (also runs on postinstall)

There is no test framework or test suite in this repo.

## Architecture

**Server actions in `app/(actions)/`** are the write layer: `matchActions.ts` (create/settle matches), `fundActions.ts` (request/approve/reject fund top-ups), `emailActions.ts` (admin bulk email). Each action does its own auth check via `getServerSession(authOptions)` and role check (`(session.user as any).role !== "ADMIN"`). API routes under `app/api/admin/funds/` are thin wrappers around these actions.

**Money & balances:** amounts are integer BDT stored in `Int` columns (variable names like `totalCostCents` are misleading — values are whole taka, formatted with `Intl.NumberFormat("en-BD", { currency: "BDT" })`). `User.balance` is a **cached** value: every balance-changing flow appends `Transaction` rows, then recomputes the balance as `SUM(transaction.amount)` for affected users inside the same Prisma `$transaction`. Never update `balance` directly without a corresponding `Transaction` row. Settlement splits cost per head where heads = players + their guests (`MatchParticipant.guests`).

**Email queue:** all emails go through `EmailQueue` (Prisma model) rather than being sent inline. `lib/queue.ts` — `enqueueEmail(type, payload)` writes a row; `processQueue()` picks up to 5 PENDING jobs (max 3 attempts) and dispatches by `type` to the sender functions in `lib/email.ts` (nodemailer via Gmail app password, inline-styled HTML templates). Actions enqueue then fire-and-forget `processQueue().catch(...)`; `app/api/queue/process/route.ts` is the cron-triggered fallback, guarded by `CRON_SECRET` (Bearer header, `x-cron-secret` header, or `?secret=` query param — open when unset for local dev). To add an email type: add the sender in `lib/email.ts`, extend the `EmailType` union and the switch in `lib/queue.ts`.

**Ratings & team builder:** each player has a static 1–10 score per position (`PlayerSkill`, unique per user+position; unrated = 5). Admin edits them at `/admin/ratings`; `/admin/teams` splits selected players into two balanced squads via `lib/teams.ts` (`generateTeams`: top-2 GK scores split one per team, others valued at best outfield score, snake draft + greedy swap improvement, random tie-breaks for variety). Saving writes `team`/`position` onto `MatchParticipant` (`saveTeams` in `app/(actions)/teamActions.ts`), which the settle form pre-selects and the public `/matches` cards render as Team A/B lineups.

**Auth:** `lib/auth.ts` — Google provider only (signIn callback rejects others), JWT sessions, PrismaAdapter creates the `User` row on first login with `role: USER`. The user's `role` and `id` are stuffed onto the session via callbacks and read with `as any` casts throughout (no next-auth type augmentation exists). `middleware.ts` gates `/dashboard`, `/funds`, `/admin` behind login only; **admin role enforcement happens in pages/actions, not middleware** — admin pages redirect non-admins, actions throw.

**Routing:** public pages at `/`, `/about`, `/matches`, `/signin`; user pages `/dashboard`, `/funds`; admin under `/admin/*` (balances, funds, matches, settle, emails). Client components live next to their page (e.g. `app/admin/settle/SettleForm.tsx`) — there is no `components/` directory despite the shadcn aliases in `components.json`.

## Environment

Required env vars (in `.env` / `.env.local`, not committed): `DATABASE_URL` + `DIRECT_URL` (Neon), `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, `EMAIL_ADDRESS` + `APP_PASSWORD` (Gmail app password for nodemailer), `EMAIL_FROM`, `ADMIN_EMAIL_LIST` (JSON array or comma-separated), `CRON_SECRET`.
