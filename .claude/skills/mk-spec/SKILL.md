---
name: mk-spec
description: Interview the user about an idea for the CREATIVE MK site until the behaviour is unambiguous, then file a build-ready GitHub issue with a measurable contract and a visual scope. Use when asked to spec work for the site loop or plan a change. Interactive — requires the user present; never run unattended.
---

# Spec interview — CREATIVE MK site

Turns an idea into a GitHub issue so complete that the builder needs nothing
else. Research the code, interview in rounds until confident, draft, confirm,
file. The user is the taste and product brain; you are the codebase brain.
Never guess a design or product decision.

## 1. Research before asking

Read the relevant code first. This site is small enough to hold entirely:
`index.html`, `css/` (16 files), `js/` (7 files), `contact-src/` for the React
contact page. Find which files own the behaviour, which CSS custom properties
in `css/variables.css` already exist, and what patterns the code repeats.

Never ask the user something the codebase can answer.

## 2. Interview in rounds

Ask 1-4 questions per round, each with concrete options and your recommended
option first. Ask only genuine product, design or priority decisions:

- Behaviour forks: what exactly changes, on which breakpoints, for which locale
- Visual scope: which sections may change appearance and which must not
- Scope boundaries: what is explicitly out of this issue
- Edge cases that change acceptance criteria: empty states, long strings in
  Spanish, reduced motion, keyboard navigation
- Trade-offs: if the change costs performance or accessibility, surface it now

After each round, fold the answers in and apply the confidence test:

> Could two different designers read this spec and ship the same observable
> result, and would a reviewer be able to tell objectively whether they did?

If any fork remains, ask another round. There is NO cap on rounds. A tweak may
need two questions; a section redesign legitimately needs 10-20+. Never stop
early because it feels like a lot of questions. Once the test passes, stop.

## 3. Draft the issue

Use exactly this shape:

```md
## Problem

What user or business problem does this solve? One or two sentences.

## Acceptance Criteria

- [ ] AC-1 — Observable, testable outcome
- [ ] AC-2 — Observable, testable outcome

## Non-goals

- NG-1 — What must NOT change
- NG-2 — What is explicitly excluded or saved for later

## Visual scope

- In scope: `#hero`, `.hero__title`  — these may change appearance
- Out of scope: every other section must render pixel-identically
- Breakpoints to verify: 375, 768, 1280

## Design tokens

- Allowed: existing custom properties in css/variables.css
- New tokens required: none | list them and say why

## Relevant files

- path/to/file.css — why it matters

## How to verify

1. Numbered manual steps: where to go, what to do, what should happen.
   Cover every AC.
```

Rules for the draft:

- Every `AC-N` must be checkable by a person or a script without debate. Prefer
  a number: a Lighthouse budget, a rule in `scripts/check-site.mjs`, a count, a
  measured size. "Looks better" is not an acceptance criterion; "the hero LCP
  image is under 200 KB and LCP stays under 2.5 s on desktop" is.
- For work that is genuinely about appearance, the AC is the *described* result
  plus the visual scope. The reviewer will not judge taste — it will confirm
  that only the in-scope sections changed and attach evidence for the user.
- **Visual scope is mandatory.** Every issue names what may change and what must
  stay identical. An issue without it cannot be built.
- **Design tokens are mandatory.** If the work needs a colour, font or spacing
  value that is not already in `css/variables.css`, the issue must say so
  explicitly and the user must approve it in this session. Brand identity is not
  something an agent invents.
- No acceptance criterion may require a non-goal. Resolve it with the user first.
- Size the issue to one day of agent work or less. Bigger work becomes a chain
  of small issues, each buildable on top of the merged ones before it.
- If the work touches a sensitive path (see `mk-build`), say so in the issue:
  it will require human review regardless of the outcome.

## 4. Confirm and file

Show the full draft in chat and get the user's go-ahead. Then file it:

```bash
gh issue create --title "TITLE" --body-file BODYFILE
```

Report the issue number and URL returned by GitHub. Later skills use that
number rather than guessing it.

## Hard rule

Never apply the `mk-ready` label. The user applies it after a final read. That
label is the approval gate between "idea" and "an agent builds it", and it is
the only thing standing between a rough thought and a PR.
