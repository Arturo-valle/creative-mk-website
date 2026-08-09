---
name: mk-build
description: Claim the next approved GitHub issue for the CREATIVE MK site, implement it, verify it, and open a PR against the next branch. Use when asked to run the site build loop, work the approved queue, or fix mk-review feedback. Designed for /loop; one pass does one unit of work.
---

# Site builder — CREATIVE MK

One pass = one unit of work: either fix review feedback on one existing PR, or
build one issue end to end. Under `/loop`, each iteration runs this once.

**Everything targets the `next` branch. Never open a PR against `main` or any
`production-*` branch, and never push to them.** Promotion to production is a
human action outside this loop.

## 0. Preflight

Before touching GitHub, branches or files:

- Confirm `origin` is `Arturo-valle/creative-mk-website` and is reachable.
- Confirm the `next` branch exists on origin. If it does not, stop and tell the
  user to create it; do not invent a base branch.
- Require a clean working tree (`git status --porcelain` must be empty). If it
  is dirty, report the paths and end the pass. Never stash, reset, checkout over
  or commit unrelated work.

## 1. Review feedback first

```bash
gh pr list --state open --label mk-changes-requested --json number,title,headRefName,headRefOid,labels,updatedAt,url
```

Skip every PR carrying `needs-human-review`; it has left the automated queue
until a human resolves the escalation.

If any PR remains, take the least recently updated one. Read its linked issue
and the latest `MK review of COMMIT_SHA` comment. Check out its branch, fix only
the "Must fix before merge" items, re-run the checks in section 4, push, remove
`mk-changes-requested`, and comment what changed. End the pass.

If a fix would cross a non-goal, leave the issue's visual scope, or require a
taste decision, do not implement it. Comment the exact conflict, add
`needs-human-review`, remove `mk-changes-requested`, and end the pass.

## 2. Pick

```bash
gh issue list --state open --label mk-ready --json number,title,labels,assignees,updatedAt
```

Take issues that are labeled `mk-ready`, unassigned, and not labeled
`mk-blocked`. Oldest first. If the queue is empty, say so and end the pass. Do
not invent work.

## 3. Claim

```bash
gh issue edit NUMBER --add-assignee @me
```

Claim before reading deeply or writing code. Re-fetch the issue immediately
after; if it is now assigned to somebody else, blocked, or no longer
`mk-ready`, drop it and return to step 2.

The assignee is a cooperative lock between people, not an atomic lock between
two sessions authenticated as the same account. **Run only one builder loop at
a time on this repository.**

## 4. Build

- Create a branch from the latest `origin/next`, named `mk-NNN-short-slug`
  using the real issue number.
- Implement only the acceptance criteria. Non-goals are binding. Compare every
  `AC-N` against every `NG-N` before editing.
- Respect the issue's **visual scope**: sections listed as out of scope must
  render identically. Do not "improve" them in passing.
- Respect the issue's **design tokens**: use the custom properties already in
  `css/variables.css`. If the work needs a new colour, font or spacing value
  that the issue did not explicitly authorise, go to section 8 instead of
  inventing one.
- Follow the existing style: plain CSS per section file, no framework in the
  static site, `data-i18n` keys for every user-visible string.
- Any new user-visible string must be added to **both** `en` and `es` in
  `js/i18n.js`. The site is bilingual; a missing key fails CI.

### Sensitive paths

A change touching any of these is allowed, but the PR must be labeled
`needs-human-review` when you open it, and it can never be auto-approved:

```
cloudflare/agent/**      admin/**            .github/**
_headers                 netlify.toml        package.json
package-lock.json        scripts/**          vite.config.js
```

These carry lead data, PII, deployment behaviour or the verification layer
itself. State plainly in the PR body which sensitive path you touched and why.

## 5. Verify

```bash
npm run verify
```

That runs the build, the Worker typecheck and the site invariants. All of it
must pass before opening a PR. Then capture visual evidence:

- Open the built site and screenshot every in-scope section at **375, 768 and
  1280** px, before and after.
- Screenshot every out-of-scope section listed in the issue at the same widths
  and confirm it is unchanged.
- If anything out of scope moved, you have a defect. Fix it or go to section 8.

Review `git diff` and `git status` before shipping. Stop if the diff contains
unrelated work, secrets, or regenerated build artefacts you did not intend
(`contact-assets/` changes whenever the contact page is rebuilt — that is
expected only when you actually changed `contact-src/`).

## 6. Ship

```bash
gh pr create --base next --title "TITLE" --body-file BODYFILE
```

The PR body must include:

- What changed and why
- `Closes #NNN`
- A scope ledger: one evidence line per `AC-N`, one preservation line per
  `NG-N`, and `Other behaviour changes: None`
- The visual evidence: screenshots per breakpoint, in-scope and out-of-scope
- `npm run verify` result, and the Lighthouse delta if the change could affect
  performance
- Numbered manual test steps matching what was actually built
- Risk: Low / Medium / High, and any sensitive path touched

If `Other behaviour changes: None` is not true, stop and get the issue amended
before opening the PR.

Comment the PR URL on the issue. **Never merge and never enable auto-merge.**
End the pass.

## 7. Blocked

Comment one specific question a human can answer asynchronously, apply
`mk-blocked`, and unassign yourself. Leave `mk-ready` in place; the pick query
excludes `mk-blocked`, so the issue reappears only once a human answers and
removes that label.

Never ask "this is unclear". State the exact decision, the options, and which
acceptance criterion it affects. End the pass so the next iteration can pick
different work.
