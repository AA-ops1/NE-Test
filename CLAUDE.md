# Repository working rules

> **Before every PR (TL;DR):** branch off `main` → commit → push →
> open a PR with a clear title → assign `othAlmubarak` & `moashour94`
> → leave it open for review.

## Pull requests for all changes
**Every new change must be delivered as a GitHub Pull Request — never pushed
directly to `main`.**

Workflow for any change (feature, design update, fix, refactor):
1. Create a new branch off `main` using a `type/short-description` name.
2. Commit the change to that branch and push the branch.
3. Open a Pull Request into `main` with a **clear, specific title** that
   states what the change does — not a vague label.
   - Good: `Profile page: fill full screen width`
   - Good: `Implement 2026-06-16 design: Account panel + Profile journey`
   - Avoid: `Update`, `Changes`, `Fixes`, `WIP`.
4. Assign **`othAlmubarak`** and **`moashour94`** as reviewers on every PR.
5. Leave the PR open for the user to review and merge (do not self-merge
   unless explicitly asked).

## Branch naming
Use `type/short-description`, where `type` is one of:
`feat` · `fix` · `design` · `refactor` · `chore` · `docs`
(e.g. `design/account-panel`, `fix/profile-width`).

## Commit messages
- Write in the **imperative mood** ("Add account panel", not "Added").
- Keep the subject line ≤ ~72 chars; add a body for the *why* when useful.

## Keeping your branch current
Before requesting review, update your branch from `main` (rebase or merge)
and resolve any conflicts so the PR is clean to merge.

## Merging
- Require **CI green** and at least one approval before merge.
- Prefer **squash merge** to keep `main` history linear.
- Delete the branch after merge.

## PR description template
```
## What
<one-line summary of the change>

## Why
<motivation / problem being solved>

## How tested
<steps, screenshots, or "n/a">
```

The PR description should summarize what changed and why, and — for design
imports — note which design delta / CHANGELOG date it implements.
