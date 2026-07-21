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
- Changes must not regress audio default, clipboard, or file-manager behavior.
- Commits touching `public/` are consumed verbatim by the terminal-streaming image build —
  keep `public/js/kclient.js` path stable.
