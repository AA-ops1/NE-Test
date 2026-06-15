# Token display with sample data

_Started 2026-06-15 13:40 UTC_

---

## User

Let's reverse it. When you show the token, make the button show sample data

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now let me log this per the project's changelog rules.

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: done]_

The toggle now describes the action it triggers: while tokens are showing it reads **Sample data** (eye), and while sample data is showing it reads **Show tokens** (tag). Change is logged in `CHANGELOG.md`. The lint findings are all pre-existing in unrelated code, not from this edit.

