# ADR 0003: Deterministic file-manager locale — parent-frame tier, URL-only persistence

- Status: Accepted (amends ADR 0001's resolution order and persistence rule)
- Date: 2026-07-21

## Context

ADR 0001's resolution order read the **top** frame's `?lang=` to cover the nested
`files` iframe, assuming standalone kclient where top == the kclient index page. Behind
TermHub there is one more frame above: top is the TermHub SPA, whose URL carries no
`?lang=`. The files frame therefore never saw a URL signal and fell through to
`localStorage['kclient.lang']` — a value it **races** the parent frame for, because the
`#files_frame` document fetch starts before the parent's `i18n.js` executes. On a loss
(first zh session after an image update, storage empty) it resolved `navigator.language`
→ English, and — worse — persisted that navigator-derived `'en'`, clobbering the durable
hint. Observed as an English file manager inside a zh session.

## Decision

1. Resolution order becomes, fail-soft at every tier:
   `?lang=` on own URL → `?lang=` on **parent**-frame URL → `?lang=` on top-frame URL
   (only when top is a distinct third frame) → `localStorage['kclient.lang']` →
   `navigator.language` → `en`. The parent of the files frame is the kclient index —
   the one frame guaranteed to carry `?lang=` when an embedder sets it, at any nesting
   depth. Standalone kclient is unchanged (parent == top there).
2. **Persist only URL-derived locales** to `localStorage['kclient.lang']`. The
   navigator fallback must never overwrite the durable hint; re-persisting a
   localStorage-read value is a pointless no-op, so it is skipped too.
3. Hardening: `index.js` allowlists `req.query.lang` to exactly `'zh_CN' | 'en' | null`
   and templates it into the files iframe src (`files?lang=…`), making the files frame
   tier-1 deterministic. The template reads `locals.lang` so it renders fine under a
   stock/base-image `index.js` that doesn't pass the variable — required because the
   terminal-streaming image overlays **only `public/`**; the fork's `index.js` does not
   ship there, and tier 2 (parent frame) carries the image until/unless it does.

## Consequences

- The files frame renders the session language deterministically on first paint —
  no race, no dependence on storage state.
- `localStorage['kclient.lang']` now only ever holds a value that some embedder
  explicitly requested via URL; consumers of the key (e.g. terminal-streaming's
  `kasmvnc-lang.js` localStorage tier) get a clean signal.
- `index.js` is no longer untouched (ADR 0001 said "no server-side changes");
  the change is dependency-free and the template degrades without it.
