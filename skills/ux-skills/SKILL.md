---
name: ux-skills
description: >
  Entry point for the UX Skills pack (Intent + Awesome UX). Use for install
  orientation, project UX context setup (init), command routing, and "what
  should I run next?" guidance. Trigger when the user says /ux-skills, "ux
  skills", "set up UX context", "which UX skill", "start design work", or
  needs a next-step recommendation across strategy, journeys, AI product
  design, accessibility, and handoff.
---

# UX Skills

Shared UX vocabulary for AI harnesses — same idea as Impeccable's `/impeccable <command>`, but for **product UX strategy + AI product design**, not visual desloppification.

**Install (once per machine/project):**
```bash
npx ux-skills install
```

Then reload your agent.

---

## Commands

### `/ux-skills` or `/ux-skills help`

Recommend the next skill from what the user is trying to do. Print a short decision tree and wait for their pick.

### `/ux-skills init`

**Run this first on a new project** (Impeccable's `/impeccable init` equivalent).

Create **`UX-CONTEXT.md`** in the project root by interviewing briefly (don't dump a huge form — max 6 questions, skip what you can infer from the repo):

1. **Surface** — brand/marketing site, product app, AI feature, internal tool, or mixed?
2. **Users** — who, in what context, under what constraints? (behavior, not demographics)
3. **Job to be done** — what success looks like for them this week
4. **Business model / pressure** — how the product makes money; what metrics people care about
5. **Hard constraints** — platform, timeline, regulatory (GDPR, HIPAA, COPPA…), legacy UI
6. **Ethical stance** — opt-in defaults, engagement vs utility, vulnerable populations

Write `UX-CONTEXT.md` with sections:

```markdown
# UX context

## Users
## Jobs to be done
## Product & business
## Constraints
## Ethical stance
## Success signals
## Anti-patterns we refuse
## Next recommended skill
```

Default ethical stance if unclear: **maximum user protection** (opt-in, no dark patterns, a11y baseline).

End by recommending **one** next command (usually `/strategize`, `/journey`, `/evaluate`, or `/ai-governors`).

### `/ux-skills status`

If `UX-CONTEXT.md` exists, summarize it in 5 bullets and suggest the highest-leverage next skill. If missing, run init.

### `/ux-skills route <plain English>`

Map a free-text ask to a skill and either invoke that skill's protocol or tell the user to run `/skill-name`.

---

## Full session path

Like Impeccable's plan → build → review → refine:

| Phase | Command | Role |
|-------|---------|------|
| Context | `/ux-skills init` | Project UX context file |
| Plan | `/strategize` · `/investigate` · `/double-diamond` | Frame problem with evidence |
| Design | `/journey` · `/organize` · `/articulate` | Flows, IA, words |
| AI product | `/ai-governors` · `/ai-inputs` · `/ai-trust-builders` · … | Control, trust, identity |
| Review | `/evaluate` · `/audit` · `/general-design-review` · `/include` | Quality + a11y |
| Craft | `/craft` · `/cognitive-load-conversion` · `/polish` via craft | Surface quality |
| Harden | `/fortify` · `/transpose` · `/localize` | Real-world + platforms |
| Ship | `/specify` | Engineering handoff |

Cross-cutting anytime: `/philosopher`, `/storytelling`, `/measure`.

---

## Decision tree

```
What do you need?
│
├─ First time on this repo          → /ux-skills init
├─ Don't know the problem           → /strategize
├─ Need research plan / synthesis   → /investigate
├─ Design a user flow               → /journey
├─ Structure navigation / IA        → /organize
├─ Write UI copy                    → /articulate
├─ AI feature (control/trust/input) → /ai-governors (then suite)
├─ Evaluate UX heuristic          → /evaluate
├─ Technical quality check          → /audit
├─ Accessibility                    → /include
├─ Visual craft / AI-slop UI        → /craft
├─ Forms feel heavy                 → /cognitive-load-conversion
├─ Edge cases / empty / error       → /fortify
├─ Ready for eng                    → /specify
└─ Stuck                            → /philosopher
```

---

## Agents (if installed)

| Agent | When |
|-------|------|
| `@noor` | Entry, context, ethics routing |
| `@ember` | Strategy + research |
| `@wren` | Flows + IA + copy |
| `@vigil` | Quality + a11y + fortify |
| `@rune` | Specs / handoff |
| `@sage` | Expansive thinking |
| `@atlas` | AI product design suite |

---

## Principles (always on)

1. Respect user autonomy — no dark patterns
2. Design for real conditions — stress, disability, slow networks
3. Make intent visible — what / why / next
4. Evidence over intuition
5. Systems over screens
6. Ethical defaults

When `/persuasive-ux` is used, **cross-check** recommendations against the Intent anti-pattern catalog in `/intent`.

---

## Provenance

- Strategy foundation: [ghaida/intent](https://github.com/ghaida/intent) (CC0)
- AI + craft extensions: [tommyjepsen/awesome-ux-skills](https://github.com/tommyjepsen/awesome-ux-skills)
- Packaging pattern inspired by [impeccable.style](https://impeccable.style/docs/) (`npx … install`, multi-harness, init, command vocabulary)

See CREDITS.md in the package repo.
