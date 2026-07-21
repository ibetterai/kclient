// TermHub theme bridge (ADR 0004). Fail-soft at every step.
//
// kclient frames are served same-origin behind TermHub's path proxy, so TermHub's
// theme preference is readable directly: localStorage['ib-theme'] holds
// 'light' | 'dark' | 'system'. 'system' (or absent/unreadable) follows the OS via
// prefers-color-scheme; anything unreadable defaults to dark (kclient's historic look).
// Sets data-theme="light"|"dark" on <html>; public/css/theme.css keys off it.
// No dependencies, no build step. Standalone kclient (no TermHub) simply stays dark
// unless the OS prefers light and no stored preference says otherwise.
(function () {
  'use strict';

  function resolveMode() {
    var pref = null;
    try { pref = window.localStorage.getItem('ib-theme'); } catch (e) { pref = null; }
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
  // and OS scheme changes while in 'system' mode. Both listeners are optional.
  try {
    window.addEventListener('storage', function (ev) {
      if (!ev || !ev.key || ev.key === 'ib-theme') apply();
    });
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
