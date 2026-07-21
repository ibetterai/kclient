# SCOPE — ibetterai/kclient

Fork of [linuxserver/kclient](https://github.com/linuxserver/kclient) (archived at v0.4.1)
— the KasmVNC sidebar web client bundled at `/kclient` in
`lscr.io/linuxserver/baseimage-kasmvnc` images. This fork adds i18n so the sidebar
follows the per-session UI language, and absorbs TermHub's audio-default patch as a
first-class feature.

## "Done" in 2 sentences

`ibetterai/kclient` has an i18n layer with `en` and `zh_CN` translations; its UI language
follows the session locale. TermHub's browser-vnc image builds with this fork at `/kclient`
replacing the bundled copy, and the build-time `TERMHUB_AUDIO_DEFAULT` sed-patch in
terminal-streaming is deleted because the fork supports it natively.

## Scope

| Status | Item | Owner |
|--------|------|-------|
| IN | i18n mechanism: JSON locale files + lookup; language from URL param / injected setting, falling back to `navigator.language`, then English | Huilin |
| IN | Translate all sidebar UI strings: `en` + `zh_CN` | Huilin |
| IN | Native audio-default support (replaces TermHub's appended `TERMHUB_AUDIO_DEFAULT` snippet) | Huilin |
| IN | Consumption by terminal-streaming: `git clone` of this fork at a pinned commit in `docker/browser-vnc/Dockerfile`, overlaid at `/kclient` | Huilin |
| OUT | Translating KasmVNC's own web UI (separate codebase) | — |
| OUT | Languages beyond en / zh_CN | — |
| OUT | Forking/rebuilding the linuxserver base image itself | — |
| OUT | Release CI / publishing artifacts from this repo beyond what the image build needs | — |

Consumption method was UNCERTAIN at kickoff; decided 2026-07-21: **git clone pinned to a
commit at image build** (no vendored snapshot, no published asset).

## Repositories

| Repo | Role | Relation |
|------|------|----------|
| `ibetterai/kclient` (this) | i18n-enabled kclient fork | Source overlaid into the image |
| `ibetterai/terminal-streaming` | TermHub — browser-vnc Docker image + session orchestration | Consumer; its Dockerfile clones this fork and its sed-patch gets deleted |
| `linuxserver/kclient` (upstream) | Original, archived read-only | Fork parent; no sync expected |

## Constraints

- No regression in audio default, clipboard, or sidebar behavior on arm64 and amd64.
- Image size delta ~zero (JS/JSON only).
- Fail-soft to English on unknown/missing locale (matches TermHub's glibc-fallback rule).
- If the base image stops shipping `/kclient` at the expected path, the image build must
  fail loudly, not silently ship the bundled English copy.
