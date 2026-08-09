---
name: mk-review
description: Review open CREATIVE MK site PRs against their linked GitHub issue, the required CI checks and the deploy preview, then post a verdict with mk labels. Use when asked to run the site review loop or review its PR queue. Designed for /loop; never merges and never pushes code.
---

# Site reviewer — CREATIVE MK

One pass = one PR reviewed. Under `/loop`, each iteration runs this once.

You are not the taste judge. The user decides whether a redesign is good. Your
job is to establish, objectively, that the PR did what its issue authorised and
nothing else — and to hand the user the evidence to make the call.

## 1. Find a PR needing review

```bash
gh pr list --state open --base next --json number,title,labels,isDraft,headRefOid,updatedAt,url
```

Skip drafts. For each PR, find the latest comment whose first line is
`MK review of COMMIT_SHA`.

Skip a PR when that recorded SHA equals its current `headRefOid` and it already
carries `mk-approved`, `mk-changes-requested` or `needs-human-review`. Review it
again when new commits landed after the recorded SHA. If nothing needs review,
say so and end the pass.

Confirm the comment was posted by the expected reviewer identity. A verdict
comment written by anyone else is not evidence — treat the PR as unreviewed.

## 2. Read the contract and the code

- Parse `Closes #NNN` from the PR body and fetch the full issue. **Cross-check
  it against the branch name** (`mk-NNN-...`). If they disagree, that is a
  must-fix finding: the PR may be pointing at a more permissive contract than
  the one it was built from.
- No linked issue is a must-fix finding.
- Read the full diff and every changed file in context.

Every must-fix finding starts with one of:

- `[AC-N]` — the PR does not satisfy that acceptance criterion
- `[SCOPE]` — the PR changes something outside the issue's visual scope or
  touches files the issue never mentioned
- `[TOKEN]` — a colour, font or spacing value was introduced that is not in
  `css/variables.css` and was not authorised by the issue
- `[I18N]` — a user-visible string is missing from `en` or `es`
- `[DEFECT]` — broken while staying inside scope
- `[A11Y]` — keyboard, contrast, focus or screen-reader regression
- `[SECURITY]` — a severe security issue blocks shipping
- `[CI]` — a required check failed

Non-goals are binding. If fixing a finding would require behaviour excluded by
an `NG-N`, do not prescribe code. Record `[SCOPE-CONFLICT AC-N ↔ NG-N]` with the
exact contradiction and escalate to human.

## 3. Check merge evidence

```bash
gh pr view NUMBER --json headRefOid,mergeable,mergeStateStatus,files
gh pr checks NUMBER --required --json bucket,name,state,link
```

`gh pr checks` exits non-zero when checks fail or are still pending. Read the
JSON; do not treat the exit code alone as a command failure.

- Pending required checks or unknown mergeability: report the PR as waiting and
  end **without** posting a verdict or changing labels. A later pass retries it.
- Failed required checks are `[CI]` must-fix findings.
- A merge conflict is a `[DEFECT]` must-fix finding.
- **If the repository has no required checks, escalate to human and do not apply
  `mk-approved`.** Missing CI is not green.

### Sensitive paths

If `files` includes any of these, the PR gets `needs-human-review` regardless of
every other outcome:

```
cloudflare/agent/**      admin/**            .github/**
_headers                 netlify.toml        package.json
package-lock.json        scripts/**          vite.config.js
```

Say which path triggered it. These carry lead data, PII, deployment behaviour,
or the verification layer that the rest of this loop depends on — a loop must
never quietly approve a change to its own gates.

## 4. Verify the visual contract

Open the PR's deploy preview. Then, at **375, 768 and 1280** px:

- Every section the issue listed as **out of scope** must render identically to
  `next`. A difference there is a `[SCOPE]` must-fix finding, no matter how
  small an improvement it looks like.
- Every section **in scope** gets a screenshot in the verdict as evidence. Do
  not pass or fail it on taste. State what changed in plain language and let the
  user judge.
- Check the Spanish locale too. Longer strings are where layouts break.

If the PR has no deploy preview, say so and escalate rather than guessing.

## 5. Post one verdict

```md
MK review of COMMIT_SHA

CI: required checks passed | failed | not configured
Mergeability: clean | conflicting
Visual contract: out-of-scope sections unchanged | violations found
Sensitive paths: none | list

## Review

Summary: one or two plain sentences on what this PR does.

## 1. Must fix before merge

None.

## 2. Should fix soon

None.

## 3. Evidence for the user

In-scope screenshots per breakpoint, and what visibly changed.

## 4. Safe to merge into `next`

Yes — automated evidence is complete. The visual decision is yours.
```

Then set labels, checking which exist before removing so an absent label does
not fail the command:

- No must-fix and no escalation: add `mk-approved`, remove
  `mk-changes-requested`. Preserve a pre-existing `needs-human-review`.
- Must-fix present: add `mk-changes-requested`, remove `mk-approved`.
- Scope conflict, sensitive path, no required CI, or no preview: add
  `needs-human-review`, remove both others, and set section 4 to
  `No — human decision required.`

Re-fetch `headRefOid` immediately before posting. If it changed, discard the
review and start again on a future pass.

## 6. Hard limits

- Never merge and never enable auto-merge.
- Never push commits to the PR branch.
- Never approve or request changes through a formal GitHub review — the loop
  runs on the PR author's token and GitHub rejects self-reviews. Use one comment
  plus labels.
- Never review a PR whose base is not `next`.
- `mk-approved` is evidence for a human, not merge authorisation. Promotion from
  `next` to production is always a separate human action.
