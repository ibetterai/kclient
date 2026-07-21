# ADR 0002: Audio-default absorbed natively, sed contract preserved

- Status: Accepted
- Date: 2026-07-21

## Context

Upstream kclient ships the audio stream OFF with no way to default it on. TermHub works
around this by appending a ~40-line snippet to `kclient.js` at image-build time
(`docker/browser-vnc/Dockerfile`) and rewriting a `var TERMHUB_AUDIO_DEFAULT = "N";`
placeholder at container start (`install-autostart.sh`), driven by the per-machine
`TERMHUB_AUDIO_DEFAULT` env var. The build-time append is a hack this fork exists to delete.

## Decision

The fork carries the auto-enable logic natively at the end of `public/js/kclient.js`,
guarded by a config line with the EXACT upstream-TermHub shape:

```js
var TERMHUB_AUDIO_DEFAULT = "1";
```

TermHub's container start hook keeps sed-rewriting that literal line from
`TERMHUB_AUDIO_DEFAULT`; the Dockerfile's append-snippet RUN block is deleted.

## Consequences

- The capability lives in the fork (owned, reviewed, versioned); the per-machine DECISION
  stays an env var delivered at container creation — flipping it never needs an image rebuild.
- The sed contract is deliberately unchanged: old and new install-autostart.sh both work
  against this fork, and the fork works (default on) even with no hook at all.
- Fail-soft preserved: an unset/garbage value means ON, matching the shipped default; a
  missing line makes the hook's sed a no-op and the session still starts.
