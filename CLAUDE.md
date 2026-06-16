# Repository working rules

## Pull requests for all changes
**Every new change must be delivered as a GitHub Pull Request — never pushed
directly to `main`.**

Workflow for any change (feature, design update, fix, refactor):
1. Create a new branch off `main` with a short descriptive name
   (e.g. `design/account-panel`, `fix/profile-width`).
2. Commit the change to that branch and push the branch.
3. Open a Pull Request into `main` with a **clear, specific title** that
   states what the change does — not a vague label.
   - Good: `Profile page: fill full screen width`
   - Good: `Implement 2026-06-16 design: Account panel + Profile journey`
   - Avoid: `Update`, `Changes`, `Fixes`, `WIP`.
4. Assign **`othAlmubarak`** as the reviewer on every PR.
5. Leave the PR open for the user to review and merge (do not self-merge
   unless explicitly asked).

The PR description should summarize what changed and why, and — for design
imports — note which design delta / CHANGELOG date it implements.
