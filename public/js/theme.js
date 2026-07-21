// TermHub theme bridge (ADR 0004). Fail-soft at every step.
//
// kclient frames are served same-origin behind TermHub's path proxy, so TermHub's
// theme preference is readable directly. TermHub stores it in the 'ib-theme'
// COOKIE (Path=/, values 'light' | 'dark' | 'system') plus a legacy
// localStorage['theme'] mirror — it never writes localStorage['ib-theme'].
// Resolution: cookie 'ib-theme' -> localStorage['theme'] -> 'system'.
// 'system' (or absent/unreadable) follows the OS via prefers-color-scheme;
// anything unreadable defaults to dark (kclient's historic look).
// Sets data-theme="light"|"dark" on <html>; public/css/theme.css keys off it.
// Live-follow: 'storage' events cover the legacy localStorage mirror, and a
// light cookie poll covers the cookie (cookie writes fire no event).
// No dependencies, no build step. Standalone kclient (no TermHub) simply stays
// dark unless the OS prefers light and no stored preference says otherwise.
(function () {
  'use strict';

  function readCookiePref() {
    try {
      var parts = String(document.cookie || '').split(';');
      for (var i = 0; i < parts.length; i++) {
        var kv = parts[i];
        var eq = kv.indexOf('=');
        if (eq < 0) continue;
        if (kv.slice(0, eq).trim() === 'ib-theme') {
          var v = kv.slice(eq + 1).trim();
          if (v === 'light' || v === 'dark' || v === 'system') return v;
        }
      }
    } catch (e) { /* cookie unreadable */ }
    return null;
  }

  function readPref() {
    var pref = readCookiePref();
    if (pref) return pref;
    // Legacy mirror TermHub still writes alongside the cookie.
    try {
      var legacy = window.localStorage.getItem('theme');
      if (legacy === 'light' || legacy === 'dark' || legacy === 'system') return legacy;
    } catch (e) { /* storage blocked */ }
    return null;
  }

  function resolveMode() {
    var pref = readPref();
    if (pref === 'light' || pref === 'dark') return pref;
    // 'system', absent, or unreadable -> OS preference; default dark when unknown.
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    } catch (e) { /* fall through to dark */ }
    return 'dark';
  }

  function apply() {
    try {
      document.documentElement.setAttribute('data-theme', resolveMode());
    } catch (e) { /* never break the page over theming */ }
  }

  apply();

  // Live-follow theme flips made in other same-origin tabs/frames (TermHub toggle),
  // and OS scheme changes while in 'system' mode. All listeners are optional.
  try {
    window.addEventListener('storage', function (ev) {
      // TermHub's only localStorage theme write uses the legacy key 'theme'.
      if (!ev || !ev.key || ev.key === 'theme') apply();
    });
  } catch (e) { /* no-op */ }
  try {
    // Cookie writes fire no event anywhere; poll cheaply and re-apply on change.
    var lastCookie = readCookiePref();
    setInterval(function () {
      var now = readCookiePref();
      if (now !== lastCookie) {
        lastCookie = now;
        apply();
      }
    }, 2000);
  } catch (e) { /* no-op */ }
  try {
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: light)');
      var onChange = function () { apply(); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  } catch (e) { /* no-op */ }
})();
