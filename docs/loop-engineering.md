# Loop engineering — CREATIVE MK site

Three Claude Code skills that turn GitHub into a small, human-gated factory for
this site. Adapted from [Finn-loop](https://github.com/finna/Finn-loop), with
three differences that this project needs: GitHub Issues instead of Linear, a
staging branch instead of shipping to production, and a visual contract instead
of code-only review.

```
idea → /mk-spec  → issue
     → [you apply mk-ready]              ← gate 1: approve the contract
     → /mk-build  → PR against `next`
     → /mk-review → verdict + evidence
     → [you merge into `next`]           ← gate 2: approve the result
     → ...changes accumulate on `next`...
     → [you promote `next` → production] ← gate 3: approve the release
```

Agents never merge, never push to production, and never approve a change to
their own gates.

## One-time setup

Create the staging branch and push it:

```bash
git checkout -b next production-2026-06-11 && git push -u origin next
```

Create the labels:

```bash
gh label create mk-ready --description "Approved for the build loop" --color 0E8A16
gh label create mk-blocked --description "Waiting on a human answer" --color D93F0B
gh label create mk-approved --description "Review evidence complete" --color 1D76DB
gh label create mk-changes-requested --description "Must-fix findings open" --color FBCA04
gh label create needs-human-review --description "Left the automated queue" --color B60205
```

Then, in the repository settings, mark the **`Build, typecheck and site
invariants`** check as required for pull requests. Without a required check the
reviewer escalates every PR to you by design, and the loop does nothing.

Leave the Lighthouse job advisory until its budgets hold steady across several
runs.

## Daily rhythm

1. Run `/mk-spec` when an idea hits you. Read the filed issue. If the contract
   is exactly what you want, apply `mk-ready`. **Only you apply that label.**
2. Start `/loop 10min /mk-build`. For continuous review, run
   `/loop 10min /mk-review` in a second session.
3. Merge into `next` only PRs that are `mk-approved`, conflict-free and green.
   A `needs-human-review` PR needs you to resolve the reason first.
4. Answer questions on `mk-blocked` issues, then remove the label.
5. When `next` looks right to you, promote it to production yourself.

Run only one builder loop at a time. The GitHub assignee is a cooperative lock
between people, not between two sessions on the same account.

`/loop` only runs while its session is open. Watch the first few passes before
leaving it unattended.

## What the gates actually check

| Layer | Enforced by | Blocking |
|---|---|---|
| Build, Worker typecheck, site invariants | `npm run verify` in CI | yes |
| i18n en/es parity, link and anchor integrity, SEO invariants | `scripts/check-site.mjs` | yes |
| Lighthouse budgets and accessibility score | `lighthouserc.json` | advisory for now |
| Out-of-scope sections unchanged | `/mk-review` against the deploy preview | yes |
| In-scope appearance | screenshots posted as evidence | **you decide** |

The last row is the point. The loop is allowed to redesign, but it is never
allowed to decide that the redesign is good.

## Sensitive paths

A PR touching any of these is always escalated to human review, whatever else
the verdict says:

```
cloudflare/agent/**   admin/**       .github/**
_headers              netlify.toml   package.json
package-lock.json     scripts/**     vite.config.js
```

These carry lead data and PII, deployment behaviour, or the verification layer
the loop depends on.

## Design tokens

The loop may only use custom properties that already exist in
`css/variables.css`. A new colour, font or spacing value requires an explicit
authorisation in the issue, approved by you during the `/mk-spec` session. Brand
identity is not something an agent invents.

## Known issue to fix before running unattended

`js/ai-concierge.js` falls back to the production Worker whenever the hostname
is not `creativemk.net`, and `logEvent()` fires on page load. Every CI build and
every deploy preview therefore writes analytics events into the production D1
database. Fix this before enabling deploy previews on the loop, or the lead
intelligence data will be polluted by automated traffic.
