# CONTEXT — domain glossary

- **kclient** — linuxserver's iframe wrapper around the KasmVNC web UI; adds the sidebar
  (audio toggle, file management, microphone). Ships at `/kclient` inside
  `linuxserver/baseimage-kasmvnc` images. Archived upstream at v0.4.1.
- **KasmVNC** — the VNC server + web client providing the actual remote desktop stream;
  kclient wraps it, it is NOT part of this fork.
- **sidebar** — kclient's control panel UI (the i18n target of this fork).
- **TermHub** — the terminal-streaming product; its browser-vnc feature runs browsers in
  containers based on `baseimage-kasmvnc:debianbookworm`.
- **TERMHUB_AUDIO_DEFAULT** — per-machine setting (0/1) TermHub injects so container audio
  streams to the client by default. Today: appended to `kclient.js` by the image build and
  sed-rewritten at container start. Target: a native feature of this fork.
- **session locale** — per-session UI language TermHub passes to the container as
  `LANG` / `LANGUAGE` / `BROWSER_LANG` (en_US or zh_CN; see
  `src/browservnc/containerCmd.ts` in terminal-streaming).
- **fail-soft to English** — any unknown/missing locale or translation key renders English,
  matching the glibc C-locale fallback behavior TermHub already documents.
