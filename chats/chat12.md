# Logo Sizing

_Started 2026-06-09 09:56 UTC_

---

## User

Make the logo a bit bigger

## Assistant

_[tool: grep]_

_[tool: read_file]_

The side-logo height is set in `console/login.css`. There are two `.ne-side-logo` rules — the later one (line 555) wins. Let me bump both for safety.

_[tool: str_replace_edit]_

Bumped the side wordmark from 24px to 30px.

_[tool: done]_

The findings are pre-existing and unrelated to this tweak. Done — the sidebar logo is now a bit larger.

