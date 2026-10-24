# brabos-delivery-ui

Web app for [`brabos-delivery-api`](../brabos-delivery-api), built with Next.js 16, React 19 and Tailwind CSS 4. Owners
receive and manage orders, edit the menu, follow sales and configure the shop. Customers order through the shop's link
without creating an account. Couriers confirm deliveries from their phones.

## Getting started

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

The API must be running at `API_BASE_URL`; see its README.

## Environment variables

| Variable | Where | Description |
| --- | --- | --- |
| `API_BASE_URL` | server | API base URL, e.g. `http://localhost:8080` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | client | Firebase web app key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | client | `<project>.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | client + server | Must match the API's `FIREBASE_PROJECT_ID` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | client | Firebase web app id |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | client | Cloud Messaging sender id (push) |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | client | Web Push certificate key pair (push) |
| `NEXT_PUBLIC_TIME_ZONE` | client + server | Shop time zone, default `America/Sao_Paulo` |

## Firebase setup

1. Create a Firebase project. In Authentication, enable the Google and Email/Password providers.
2. Register a Web app and copy its config into the `NEXT_PUBLIC_FIREBASE_*` variables.
3. Under Authentication › Settings › Authorized domains, add `localhost` and your production domain.
4. Under Project settings › Cloud Messaging › Web Push certificates, generate a key pair and set it as
   `NEXT_PUBLIC_FIREBASE_VAPID_KEY`. On the API, set `PUSH_ENABLED=true`.

Notification permission is only requested when the person taps a button. Owners do it in Ajustes, couriers on the
deliveries page and customers on the tracking page. On iPhone, the app must first be added to the Home Screen
(PWA, `src/app/manifest.ts`).

## Images and payments

Product photos and the shop logo work once the API has `STORAGE_PROVIDER` set to `gcs` or `r2`, plus the bucket's CORS
rule (see the API README). Until then the photo field explains that uploads are not configured.

The "Cartão online" option appears at checkout only when the shop turns on online payments. That switch needs Stripe
to be configured on the API.
