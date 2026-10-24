@AGENTS.md

# CLAUDE.md

## Rules for the AI

- Keep this file accurate: update it in the same change that alters structure, stack, commands, conventions or design rules.
- Code, identifiers, docs and commit messages are in English. User-facing copy is in Brazilian Portuguese (pt-BR).
- No comments in code unless the reason is not obvious from the code itself.
- Every new environment variable goes into `.env.example` and the README table.
- Next.js 16 differs from older versions (Proxy instead of Middleware, Cache Components): read `node_modules/next/dist/docs/` before using an API.

## Project

Web UI for `brabos-delivery-api` (FastAPI, `../brabos-delivery-api`). Stack mirrors `../project-barber-ui`.

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 (tokens in `src/app/globals.css` `@theme`)
- pnpm only; Cache Components on: anything reading `cookies()`/params or calling `new Date()` sits inside `<Suspense>`
- Firebase Auth (client SDK) for Google and email/password; `jose` verifies ID tokens on the server; Firebase Cloud
  Messaging for web push (`firebase/messaging` + `public/sw.js`)
- Tests: Vitest (jsdom) next to the code as `*.test.ts(x)`. Product name lives in `src/lib/brand.ts`.

## Auth and data flow

1. Client signs in with Firebase and POSTs the ID token to `/api/session` (httpOnly cookie); `SessionRefresher` keeps it fresh.
2. Server code calls the API: `apiFetch` (bearer from the cookie), `publicFetch` (no token), `customerFetch` (device
   token header + bearer when signed in). `API_BASE_URL` is server-only; mutations are Server Actions + `refresh()`.
3. `src/proxy.ts` redirects by cookie presence only. `loadCurrentEstablishment()` = session + `GET /establishments/me`;
   `requireEstablishment()` sends users without a shop to `/entregador` (if they are couriers) or `/cadastro`.
4. Customers never need an account: each browser keeps a random device token (`lib/customer/device.ts`, `X-Customer-Token`).
   Signing in (optional, `/?next=/e/<slug>`) links orders to the account (`/minha-conta`, loyalty counts, prefilled checkout).

## Screens

- Owner (`(app)` group, bottom tabs on mobile, top nav from `md`): `/pedidos` board (Novos / Em andamento / Finalizados
  hoje; 3 columns from `lg`, tabs below). Accept/Entregue take one tap with a 5 s "Desfazer" toast (commit delayed,
  flushed on `pagehide`); cancel asks a reason with chips. Polls every 15 s, refreshes on push, chimes and pulses new
  orders, shows the count in the tab title. First-run checklist (menu, hours). `/cadastro` registers the shop.
- `/produtos`: categories, active switch (optimistic), edit sheet (half-and-half, doneness, photo), one-tap suggestions.
- `/financeiro?periodo=hoje|7d|30d|90d`: KPIs, daily bars, payment mix, top products. `/historico?aba=pedidos|auditoria`.
- `/configuracoes`: link + push, pause orders (absence presets), delivery fee/min order/auto-accept/online payments,
  weekly hours, theme colors with live preview + contrast warning, couriers (invite link), profile/logo/slug, account.
- Public `/e/[slug]`: themed by the shop colors (`lib/color.storeTheme` on the layout wrapper), menu with search and
  category chips, product sheet, cart in `localStorage` (`brabos:cart:<slug>`, synced with the menu), one-page checkout
  (contact data remembered), sticky cart sidebar from `lg`. `/e/[slug]/pedido/[id]` tracks (polls 20 s), cancels while
  placed, enables push, "Pedir de novo".
- Courier: `/entregador` (accepted orders, route/call links, two-tap "Entreguei"), `/entregador/convite/[token]`.
- Images: `components/products/image-picker.tsx` resizes to WebP ≤ 1600 px, asks `POST /uploads` for a presigned URL
  and PUTs straight to GCS/R2; 503 from the API means storage is not configured. Images render with `next/image unoptimized`.

## Dates and money

- Times use `TIME_ZONE` (`NEXT_PUBLIC_TIME_ZONE`) via `lib/time.ts`; never call `new Date()` while rendering a client component.
- Prices are numbers from the API; `lib/money.ts` formats BRL and parses "40", "40,50", "1.200,00". Cart math lives in
  `lib/cart.ts` (half-and-half = most expensive half) and mirrors the API.

## Layout

```
src/
  app/            page.tsx (login), manifest.ts, api/session/, e/[slug]/ (store, pedido/[id]), entregador/, minha-conta/
  app/(app)/      layout (header, nav, push bridge), pedidos/, cadastro/, produtos/, financeiro/, historico/, configuracoes/
  components/     ui/ (button, text-field, chip, switch, modal, confirm-dialog, alert, icons), app/, auth/, brand/,
                  orders/, products/, settings/, establishment/, store/, courier/, customer/, push/
  lib/            api/ (client, types, owner, public), auth/, firebase/, push/, actions.ts, cart, color, orders,
                  store-hours, money, time, establishment/ products/ orders/ customer/ courier/ (validation + "use server")
public/           sw.js (push + notification click), icon-192/512.png
```

## Design system

Dark theme, red identity. Use tokens, never raw hex (except the logo and theme presets).

| Token | Hex | Use |
| --- | --- | --- |
| `canvas` / `surface` / `surface-raised` | #121212 / #1C1C1C / #272525 | Background, cards, inputs |
| `ink` / `muted` | #F7F3EF / #ABA49F | Text, captions |
| `primary` (+ `-hover`, `-soft`, `on-primary`) | #D62828 | Main actions, active tab; overridden per store on `/e/*` |
| `accent` (+ `-soft`) | #FFB703 | Prices, selection, focus ring; overridden per store |
| `slate` | #222A35 | Secondary buttons, info alerts |
| `success` / `danger` | #4ADE80 / #F87171 | Status, errors |

- Fonts: Bebas Neue (`font-display`, headings, `tracking-wide`) and Inter. Pills `h-12`, cards `rounded-3xl`.
- Mobile first (375 px, `px-4`); bottom tabs below `md`; sheets slide from the bottom; main actions within thumb reach.
  Desktop uses the space: order board columns, store sidebar cart, settings in two columns (`max-w-7xl`).

## Usability rules (Nielsen's 10 heuristics)

1. Status: spinners with verb labels, live order counts, open/closed badge, tracking steps, toasts.
2. Real-world words: pedido, cardápio, troco, ponto da carne, meio a meio, entregador.
3. Control: "Desfazer" on accept/deliver, sheets close with × / Escape / backdrop, cancel always available.
4. Consistency: `components/ui` primitives and tokens; same wording for the same action.
5. Error prevention: masks, `inputMode`, validation mirroring the API, disabled buttons when the shop is closed.
6. Recognition: chips for halves, doneness, payment, reasons, durations, color presets.
7. Flexibility: remembered contact data, "Pedir de novo", "Usar em todos" for hours, auto-accept.
8. Minimalism: fewest taps (order in ~4 taps, accept in 1); only the fields the task needs.
9. Recovery: errors say what happened and how to fix it, next to the field; carts survive failures.
10. Help: first-run checklist, contextual hints, closed-shop note with the next opening time.

Accessibility: WCAG AA contrast (`lib/color` warns on weak store colors), `role="alert"`/`status`, targets ≥ 40 px,
`lang="pt-BR"`, reduced motion.

## Commands

```bash
cp .env.example .env.local
pnpm install
pnpm dev
pnpm test
pnpm lint
pnpm build
```
