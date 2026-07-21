# DEPENDENCIES

| Dependency | What | Status | Owner | Resolution |
|------------|------|--------|-------|------------|
| `linuxserver/kclient` | Upstream source, archived at v0.4.1 | Available (read-only) | — | Forked to ibetterai/kclient on 2026-07-21 |
| `lscr.io/linuxserver/baseimage-kasmvnc:debianbookworm` | Base image shipping `/kclient` | Available | linuxserver | Pin digest in terminal-streaming Dockerfile if path drift is ever observed |
| `ibetterai/terminal-streaming` | Consumer of this fork (Dockerfile clone + overlay) | Available | Huilin | Dockerfile change tracked in that repo |
| KasmVNC protocol/server | Runtime the sidebar wraps | Available (via base image) | kasmtech | No change |

No backend APIs, design assets, or external domain expertise required. zh_CN translation
review: Huilin (native speaker).
