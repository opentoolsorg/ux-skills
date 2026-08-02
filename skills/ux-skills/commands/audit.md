---
name: audit
description: >
  Five-dimension technical quality check with P0 to P3 severity.
  Runs accessibility, performance, theming, responsive design, and anti-pattern checks against the implementation.
  Use when the user wants an accessibility check, performance audit, or technical quality review.
---

# Audit — Technical Quality Check

## Overview

`/audit` is the technical counterpart to `/evaluate`. Where `/evaluate` asks “does this feel right”, `/audit` asks “does this hold up”. It runs accessibility, performance, theming, responsive design, and anti-pattern checks against the implementation, scores each dimension 0 to 4, and produces a plan with P0 to P3 severity ratings.

Use it before shipping, during a quality sprint, or whenever a tech lead says “we should really look at accessibility”.

## How it works

The skill scans your code across five dimensions:

1. **Accessibility**: WCAG contrast, ARIA, keyboard nav, semantic HTML, form labels.
2. **Performance**: layout thrashing, expensive animations, missing lazy loading, bundle weight.
3. **Theming**: hard-coded colors, dark mode coverage, token consistency.
4. **Responsive**: breakpoint behavior, touch targets, mobile viewport handling.
5. **Anti-patterns**: deterministic checks for deceptive or manipulative UI.

Each dimension gets a 0 to 4 score. Each finding gets a severity: P0 blocks the release, P1 should fix this sprint, P2 is next cycle, P3 is polish. You get back a single document you can paste into a ticket tracker.

Audit does not fix anything. It documents. Route the findings to `/polish`, `/fortify`, or other refinement skills depending on the category.

## Output Format

Your response should follow this structure:

```markdown
## Audit Report for [Target]

**Overall Score:** [X.X] / 4

### Dimensions

- **Accessibility**: [X] / 4 — [Brief summary]
- **Performance**: [X] / 4 — [Brief summary]
- **Theming**: [X] / 4 — [Brief summary]
- **Responsive**: [X] / 4 — [Brief summary]
- **Anti-patterns**: [X] / 4 — [Brief summary]

### Issues by Severity

#### P0 — Critical (Release blocker)
- [Issue description] → Route to `/[skill]`

#### P1 — Major (Fix this sprint)
- [Issue description] → Route to `/[skill]`

#### P2 — Minor (Next cycle)
- [Issue description] → Route to `/[skill]`

#### P3 — Polish (Cosmetic)
- [Issue description] → Route to `/[skill]`
```

## Pitfalls

- **Confusing it with `/evaluate`**: Audit is implementation quality. Evaluate is UX/design quality. Run both for a full picture.
- **Fixing P3s before P0s**: The severity scale exists for a reason. Start at the top.
- **Skipping dimensions**: Theming and responsive are the ones most people assume are fine until they are not.
