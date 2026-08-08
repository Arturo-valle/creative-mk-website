# CREATIVE MK Cloudflare Activation Notes

This Worker is designed as Cloudflare-first and Free-first. Core lead capture is live with Workers, Agents SDK, Durable Objects, D1, Queues, Workflows, Workers AI, Cron, and Pages.

## Live Now

- Worker/Agent: `creative-mk-concierge`
- Public API route: `https://creativemk.net/agents/creative-mk-concierge/*`
- Admin API route: `https://creativemk.net/admin/api/*`
- Admin dashboard: `https://creativemk.net/admin/`
- D1 database: `creative_mk_concierge_analytics`
- Queue: `creative-mk-lead-jobs`
- Workflows:
  - `creative-mk-lead-enrichment`
  - `creative-mk-daily-digest`
  - `creative-mk-audit-workflow`
- Cron: `15 6 * * *`

## Admin Access

The admin API is locked unless one of these is true:

- `ADMIN_TOKEN` secret is set and the dashboard sends it as a Bearer token.
- Cloudflare Access protects `/admin/*` and `TRUST_CF_ACCESS=true` is set.

Recommended next hardening:

```bash
npx wrangler secret put ADMIN_TOKEN --config cloudflare/agent/wrangler.jsonc
```

For Cloudflare Access, protect:

- `https://creativemk.net/admin/*`
- `https://creativemk.net/admin/api/*`

Then set `TRUST_CF_ACCESS` to `true` in `wrangler.jsonc` and deploy.

## R2 Reports

Status: code is ready, binding is commented out because the current tokens cannot create R2 buckets.

Dashboard requirement:

- Add R2 permissions to the API token, or create the bucket manually.
- Bucket name: `creative-mk-lead-artifacts`

Then uncomment `r2_buckets` in `wrangler.jsonc` and deploy.

Current fallback:

- Admin CSV export streams directly from D1.
- Admin JSON Snapshot streams directly from D1 at `/admin/api/export.json`.
- Once `REPORTS_BUCKET` is active, JSON snapshots, lead artifacts, briefs, audits and daily digests are also archived privately in R2.

## Workers Analytics Engine

Status: code is ready, binding is commented out because the account has not enabled Analytics Engine.

Enable here:

```text
https://dash.cloudflare.com/2a432f7e8d56266c9dd713199ecf5b47/workers/analytics-engine
```

Then uncomment `analytics_engine_datasets` in `wrangler.jsonc` and deploy.

Datapoint shape emitted by the Worker:

- `indexes`: `event_type`, `primary_service`, `language`
- `doubles`: `lead_score`, `score_band`, `turns`, `audits`, `briefs`, `captures`
- `blobs`: `day`, `page`, `priority`

Privacy rule: Analytics Engine receives aggregated operational signals only. It does not receive name, email, phone, full transcript, full URL, lead id or session hash.

## D1 Data Retention

Status: privacy-first cleanup is live through the daily cron and D1.

Policy:

- Anonymous sessions: delete after 90 days if they never became a captured lead.
- Anonymous events: delete after 180 days when not linked to a captured lead.
- Completed or dismissed tasks: delete after 180 days.
- Consented leads, consent events, lead briefs, lead audits and captured-lead events are retained for CRM operation.

Each cleanup writes a non-PII row to `data_retention_runs`, and the latest run appears in the admin dashboard.

## AI Search

Status: local corpus fallback is live. AI Search binding is commented out until the account has the AI Search token/beta permissions.

Create token here:

```text
https://dash.cloudflare.com/2a432f7e8d56266c9dd713199ecf5b47/ai/ai-search/tokens
```

Then create:

```bash
npx wrangler ai-search create creative-mk-site-search --type web-crawler --source creativemk.net
```

After that, uncomment `ai_search` in `wrangler.jsonc` and deploy.

## Turnstile

Status: session and quota limits are active. Turnstile is optional until keys exist.

Create a Turnstile widget for:

- `creativemk.net`
- `www.creativemk.net`

Then set:

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY --config cloudflare/agent/wrangler.jsonc
```

Set the public site key in `cloudflare/agent/wrangler.jsonc`:

```jsonc
"PUBLIC_TURNSTILE_SITE_KEY": "0x4AAAA..."
```

Deploy once with `TURNSTILE_REQUIRED=false`, confirm `/agents/creative-mk-concierge/<session>/config` returns the site key, then set `TURNSTILE_REQUIRED=true` only after confirming the chat widget and contact form both submit correctly.

The public site key is served by the Worker config endpoint. The secret key stays in Worker secrets and is never sent to the browser.

## Browser Run

Status: rendered audit code is ready. Binding is commented out to avoid deploying a feature before the account confirms free quota.

When available, uncomment:

```jsonc
"browser": {
  "binding": "BROWSER",
  "remote": true
}
```

The Worker will use Browser Run only for high-intent sessions and only up to the daily quota gate.

## Email Routing

Status: `email()` handler is deployed and ready. Route email to this Worker from Cloudflare Email Routing.

Suggested route:

- `leads@creativemk.net` -> Worker `creative-mk-concierge`

Optional forwarding:

```bash
npx wrangler secret put EMAIL_FORWARD_TO --config cloudflare/agent/wrangler.jsonc
```

The destination must be a verified Cloudflare Email Routing destination.

## Rate Limiting Binding

Status: route-level Durable Object rate limiting is live. Native Rate Limiting binding is still commented out because it requires a namespace id.

After creating a namespace, uncomment `ratelimits` in `wrangler.jsonc`.

The Worker already enforces:

- per-route IP/session throttles for chat, events, audits, briefs, lead capture, consent and admin API
- 8 AI turns per session
- 1 audit per session
- 2 briefs per session
- 3 lead captures per session
- 80 widget events per session
- 120 AI calls per day globally
- 3 Browser Run audits per day globally when Browser Run is active

Current route fallback caps:

- chat: 18/minute per route fingerprint
- events: 90/minute per route fingerprint
- audit: 4/5 minutes per route fingerprint
- brief: 8/5 minutes per route fingerprint
- lead capture: 4/10 minutes per route fingerprint
- admin API: 45/minute per route fingerprint

Fingerprints are hashed from route, client address, session id when present, and user agent prefix. Raw IP addresses are not stored.
