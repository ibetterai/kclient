# ADR 0004: TermHub theme bridge + tokenized restyle + sidebar active states

- Status: Accepted
- Date: 2026-07-21

## Context

kclient's chrome (sidebar, file manager) was hardcoded white-on-translucent-black with
`!important`-heavy CSS — visually foreign next to TermHub, and blind to TermHub's
light/dark preference. kclient frames are served same-origin behind TermHub's path
proxy, so TermHub's theme preference is directly readable. TermHub stores it in the
`ib-theme` **cookie** (Path=/, values `'light' | 'dark' | 'system'`) plus a legacy
`localStorage['theme']` mirror — it never writes `localStorage['ib-theme']` (an
earlier revision of this ADR read that key and therefore never saw an explicit
TermHub choice). Separately, the audio/mic sidebar icons showed only a faint
background tint when ON — the state was not legible.

## Decision

1. `public/css/theme.css` — vendored copy of the iBetter design-token values
   (`--th-*` mirroring `--ib-*` from portal.ibetter.ai/ibetter.css): dark default at
   `:root`, `[data-theme="light"]` overrides. Vendored, not `@import`ed: kclient must
   render with zero external requests (offline containers, China route blocks Google
   Fonts/CDNs). Font stacks name Jost/Poppins/JetBrains Mono but degrade to system
   fonts — no web-font imports.
2. `public/js/theme.js` — tiny head-blocking bootstrap: resolves the preference
   fail-softly as cookie `ib-theme` → `localStorage['theme']` → `'system'`;
   `'system'`/absent → `prefers-color-scheme`; anything unreadable → dark (the historic
   look). Sets `data-theme` on `<html>`; live-follows `storage` events (key `'theme'`,
   the legacy mirror), a 2s cookie poll (cookie writes fire no event), and OS scheme
   changes. Loaded by both `index.html` and `filebrowser.html`.
3. `kclient.css` / `filebrowser.css` rewritten against the tokens. CSS-only: every
   selector produced by `kclient.js` / `filebrowser.js` is preserved (`.icons`,
   `.icons-selected`, `.fileTable`, `.deleteButton`, `.directory`, `.file`, `#loading`,
   `#dropzone`, …) — no JS or DOM changes.
4. Sidebar active state: `.icons-selected` (already toggled by `audio()`/`mic()`,
   including the mic-failure rollback and the TERMHUB_AUDIO_DEFAULT startup path, so
   the initial icon is truthful) renders as a filled accent chip with a white glyph.
   OFF keeps the muted look. The dark `#111` source SVGs are colored purely via
   `filter`: `var(--th-icon-filter)` (invert on dark, none on light) for OFF,
   `invert(100%)` over the accent background for ON.

## Consequences

- File manager and sidebar match TermHub's design language and follow its theme,
  defaulting to dark whenever anything is unreadable — fail-soft throughout.
- Adding a theme = one token block; no markup or JS churn.
- Standalone kclient (no TermHub) keeps working: no `ib-theme` cookie and no
  `theme` storage key simply means OS preference with a dark default.
- The `.close` chip sits at `top:-10px/right:-10px` outside `#files`, so `#files`
  must NOT get `overflow: hidden` (it clips absolutely-positioned descendants of a
  positioned box to a corner sliver); the iframe's rounded corners are clipped by a
  `border-radius` on `#files_frame` itself instead.
