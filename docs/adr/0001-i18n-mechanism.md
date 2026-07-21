# ADR 0001: Client-side i18n via shared i18n.js, locale from URL param

- Status: Accepted
- Date: 2026-07-21

## Context

kclient's sidebar and file-manager UI are English-only hardcoded strings. TermHub sessions
carry a per-session UI language (en_US / zh_CN) and TermHub controls the iframe URL that
loads kclient (`/browser-vnc/<sessionId>/`). Upstream is archived, so the mechanism is ours
to choose. The file manager runs in a nested iframe (`src="files"`) that does not inherit
the parent's query string.

## Decision

1. One dependency-free module, `public/js/i18n.js`, holds all dictionaries inline
   (no fetch, no JSON files — the whole catalog is ~15 keys and the page must work offline
   of any extra request).
2. Locale resolution order, fail-soft at every step:
   `?lang=` on own URL → `?lang=` on top-frame URL (same-origin; covers the `files` iframe)
   → `localStorage["kclient.lang"]` → `navigator.language` → `en`.
   Resolved value is persisted to `localStorage["kclient.lang"]`.
3. Locale normalization: `zh`, `zh-CN`, `zh_CN`, `zh-Hans*` → `zh_CN`; `en*` → `en`;
   anything else → `en`. Unknown keys fall back to the English entry, then to the key itself.
4. Static markup uses `data-i18n` / `data-i18n-title` / `data-i18n-placeholder` attributes,
   swept by `i18n.js` on load. Dynamic strings call `I18N.t(key, {vars})`.
5. TermHub delivers the language by appending `?lang=<bcp47>` to the iframe URL it already
   builds (`public/index.html` in terminal-streaming).

## Consequences

- No server-side (`index.js`) changes; no new dependencies; `package.json` untouched, so the
  base image's installed `node_modules` keep working when `public/` is overlaid.
- Adding a language = adding one dictionary to `i18n.js`. No build step.
- English remains the guaranteed fallback, matching TermHub's glibc C-locale rule.
- `?lang=` is advisory only; a stale or forged value can never produce anything but a
  supported dictionary or English.
