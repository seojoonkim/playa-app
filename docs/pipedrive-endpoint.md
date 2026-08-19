# PLAYA Framer → Pipedrive endpoint

`POST /api/pipedrive` accepts the PLAYA contact-funnel JSON and writes it to Pipedrive. It uses a **deal** (rather than a lead): deals have mature v1 search, native person/note/activity relationships, and can be retried without requiring account-specific custom-field IDs.

## Server-only environment variables

Set these in Vercel project settings; never put them in Framer/client code or a `VITE_*` variable.

- `PIPEDRIVE_API_TOKEN` (required)
- `PIPEDRIVE_COMPANY_DOMAIN` (optional, company subdomain only), or `PIPEDRIVE_API_BASE` (optional HTTPS base ending in `/v1`)
- `PLAYA_ALLOWED_ORIGINS` (required operational configuration): comma-separated exact production Framer origin(s), e.g. the actual published custom/Framer domain
- `PLAYA_PREVIEW_ORIGINS` (optional): comma-separated exact preview origins
- `PLAYA_ALLOW_LOCALHOST=true` (optional in production). Localhost is automatically accepted when `NODE_ENV` is not `production`.

No origin wildcard is used. Requests without an `Origin` header are accepted for server-to-server tooling. Browser origins must exactly match configured values. The endpoint handles `OPTIONS` and rejects methods other than POST.

## Request and limits

Requests must use `Content-Type: application/json`. JSON fields: `name`, `phone`, `company`, `source`, `sourceLabel`, `referrer`, `callTimes`, `fastTrack`, `locale`, `quiz`, `report`, `answers`, `pageReferrer`. `quiz` is the published Framer object's `q1`/`q2` answer map; numeric `report.w`, `report.c`, and `report.b` scores are accepted and preserved. `name` and `phone` are required. The endpoint caps the body at 64 KiB, every scalar, 20 quiz entries, 20 call times, and 100 answers; malformed nested values are rejected before contacting Pipedrive. Each upstream request has a 10-second timeout.

## Mapping and retry behavior

1. Search persons by normalized phone; create only when absent.
2. Compute SHA-256 over normalized phone plus canonical validated payload. The stable visible marker `PLAYA-FUNNEL:<24 hex>` is included in the deal title.
3. Search deals for the exact marker; create an open deal only when absent.
4. Add an HTML note with every accepted metadata field, all report values, and every answer key/value/label. Before adding, inspect deal notes for the marker.
5. When `callTimes` is nonempty, create a call activity containing all requested times. Before adding, inspect open deal activities for the marker.

Thus a normal retry does not create another person/deal/note/activity. Pipedrive v1 has no atomic idempotency primitive, so simultaneous first requests still have a narrow search-then-create race; the visible marker makes such records auditable/mergeable. A failure returns HTTP 502 with the failed stage and `retryable: true`. If person/deal creation succeeded before a later step failed, retry searches and reuses them, then resumes missing note/activity work. A 2xx response is only returned after all requested operations complete.

## Framer integration (when ready)

Send the complete payload as JSON to the deployed `/api/pipedrive` URL with `Content-Type: application/json`. Do not send the Pipedrive token. Treat non-2xx as failure and retry the exact same payload; changing payload content intentionally produces a new marker/deal.

## Local verification

```sh
npm test
npm run build
```

Tests mock all Pipedrive fetches and never use credentials or the network.
