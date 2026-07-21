# CLAUDE.md — ibetterai/kclient

i18n-enabled fork of linuxserver/kclient (archived v0.4.1), the KasmVNC sidebar client
shipped at `/kclient` in linuxserver baseimage-kasmvnc images. Consumed by
ibetterai/terminal-streaming's browser-vnc Docker image via pinned `git clone` overlay.

## Project Scaffold

| Field | Value |
|-------|-------|
| Tier | Small |
| Setup date | 2026-07-21 |
| Last re-entry | 2026-07-21 |
| Last check-in | - |

## Documentation Map

| Concept | Path | Status |
|---------|------|--------|
| Scope boundaries | SCOPE.md | Active |
| External dependencies | DEPENDENCIES.md | Active |
| Domain glossary | CONTEXT.md | Active |
| Architecture decisions | docs/adr/ | Active |
| Architecture overview | ARCHITECTURE.md | Active |
| Skill state | .claude/ | Active |

## Conventions

- All user-facing sidebar strings go through the i18n lookup; never hardcode English in
  markup or JS. English is the fallback for every missing key/locale.
- Locale resolution (ADR 0003): own `?lang=` → parent-frame `?lang=` → top-frame `?lang=`
  → `localStorage['kclient.lang']` → `navigator.language` → `en`; persist to localStorage
  ONLY from the URL tiers — never persist the navigator fallback.
- Styling goes through the `--th-*` tokens in `public/css/theme.css` (vendored iBetter
  values, dark default); `public/js/theme.js` maps TermHub's theme — the `ib-theme`
  COOKIE plus the legacy `localStorage['theme']` mirror (TermHub never writes
  `localStorage['ib-theme']`) — to `data-theme` on `<html>`, defaulting to dark when
  unreadable (ADR 0004). No web-font or CDN imports — plain static files that render
  offline.
- `#files` must never get `overflow: hidden` — the `.close` chip hangs outside its
  corner and would be clipped to a sliver; corner-clip the iframe via `border-radius`
  on `#files_frame` instead (ADR 0004).
- Changes must not regress audio default, clipboard, or file-manager behavior.
- Commits touching `public/` are consumed verbatim by the terminal-streaming image build —
  keep `public/js/kclient.js` path stable. The image overlays ONLY `public/`: `index.js`
  changes don't ship there, so EJS templates must render under the stock base-image
  `index.js` (new variables via `locals.*`, ADR 0003).
