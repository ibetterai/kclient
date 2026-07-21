# ARCHITECTURE — ibetterai/kclient

Fork of the archived linuxserver/kclient: an express server (`index.js`) that serves a
thin wrapper page around KasmVNC — a sidebar (audio / microphone / file manager) plus the
KasmVNC iframe — and a socket.io file manager + PCM audio bridge. Ships inside
linuxserver `baseimage-kasmvnc` images at `/kclient`; TermHub overlays this fork's
`public/` over that directory at image build (pinned `git clone`, see terminal-streaming's
`docker/browser-vnc/Dockerfile`).

## Layout

- `index.js` — express + socket.io server (port 6900): file manager ops, PCM audio out,
  microphone in. No user-facing strings; untouched by the i18n work.
- `public/index.html` — wrapper page (EJS-rendered): KasmVNC iframe + sidebar buttons.
- `public/js/kclient.js` — sidebar logic, PCM player, mic pipeline, native audio-default
  (ADR 0002).
- `public/js/i18n.js` — dictionaries + locale resolution + DOM sweep (ADR 0001). The only
  new module; everything user-facing routes through it.
- `public/filebrowser.html` + `public/js/filebrowser.js` — file manager UI (nested iframe
  at `/files`); bulk of the translatable strings.

## Decisions

- ADR 0001 — client-side i18n, locale from `?lang=` with fail-soft chain to English.
- ADR 0002 — audio-default native in the fork; TermHub's start-hook sed contract preserved.

## Invariants

- `public/` stays deployable by file-copy over the base image's `/kclient/public` —
  no new npm dependencies, no build step, no server-side template changes.
- `var TERMHUB_AUDIO_DEFAULT = "N";` line shape is a contract with TermHub's
  install-autostart.sh — do not reformat.
- English is the fallback for every missing locale and key.

## Testing stance

Structural, by inspection + live verification in a TermHub browser-vnc session (Small tier,
no test runner in this repo): sidebar renders in en and zh_CN, file manager flows
(browse/upload/delete/create folder) work in both languages, audio auto-starts by default
and stays off when the hook writes `"0"`.
