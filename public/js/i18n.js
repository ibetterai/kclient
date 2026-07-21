// Dependency-free i18n for kclient (ADR 0001, resolution amended by ADR 0003).
// No fetch, no build step. Locale resolution order, fail-soft at every step:
//   ?lang= on own URL -> ?lang= on PARENT-frame URL -> ?lang= on top-frame URL
//   -> localStorage["kclient.lang"] -> navigator.language -> "en".
// Only URL-derived locales are persisted to localStorage — the navigator fallback
// must never clobber the durable hint (ADR 0003).
(function () {
  'use strict';

  var DICTS = {
    en: {
      'sidebar.fileManager': 'File Manager',
      'sidebar.enableAudio': 'Enable Audio',
      'sidebar.enableMic': 'Enable Microphone',
      'fb.folderNamePlaceholder': 'Enter Directory Name',
      'fb.createFolder': 'Create Folder',
      'fb.uploadFiles': 'Upload Files',
      'fb.colName': 'Name',
      'fb.colType': 'Type',
      'fb.colDelete': 'Delete (NO WARNING)',
      'fb.parent': 'Parent',
      'fb.typeDir': 'Dir',
      'fb.typeFile': 'File',
      'fb.delete': 'Delete',
      'fb.uploading': 'Uploading {name}',
      'fb.fileTooBig': 'File too big {name}',
      'fb.badDirName': 'Bad or Null Directory Name'
    },
    zh_CN: {
      'sidebar.fileManager': '文件管理',
      'sidebar.enableAudio': '开启音频',
      'sidebar.enableMic': '开启麦克风',
      'fb.folderNamePlaceholder': '输入文件夹名称',
      'fb.createFolder': '新建文件夹',
      'fb.uploadFiles': '上传文件',
      'fb.colName': '名称',
      'fb.colType': '类型',
      'fb.colDelete': '删除（无警告）',
      'fb.parent': '上一级',
      'fb.typeDir': '文件夹',
      'fb.typeFile': '文件',
      'fb.delete': '删除',
      'fb.uploading': '正在上传 {name}',
      'fb.fileTooBig': '文件过大 {name}',
      'fb.badDirName': '文件夹名称为空或非法'
    }
  };

  function normalize(raw) {
    if (!raw || typeof raw !== 'string') return null;
    var v = raw.trim().toLowerCase().replace(/_/g, '-');
    if (!v) return null;
    if (v === 'zh' || v === 'zh-cn' || v.indexOf('zh-hans') === 0) return 'zh_CN';
    if (v.indexOf('en') === 0) return 'en';
    return 'en';
  }

  function langFromLocation(loc) {
    try {
      if (!loc || !loc.search) return null;
      var m = /[?&]lang=([^&#]*)/.exec(loc.search);
      return m ? decodeURIComponent(m[1]) : null;
    } catch (e) {
      return null;
    }
  }

  function resolveLocale() {
    var raw = null;
    var fromUrl = false;
    try { raw = langFromLocation(window.location); } catch (e) { raw = null; }
    if (!raw) {
      // The file manager runs in a nested iframe that does not inherit the
      // parent's query string. The PARENT frame is the kclient index page — the
      // one frame guaranteed to carry ?lang= when an embedder (TermHub) sets it,
      // regardless of how many frames sit above it (guard cross-origin).
      try {
        if (window.parent && window.parent !== window) raw = langFromLocation(window.parent.location);
      } catch (e) { raw = null; }
    }
    if (!raw) {
      // Last URL tier: the top frame, when it is a distinct third frame (an
      // embedder above the kclient index that carries ?lang= itself).
      try {
        if (window.top && window.top !== window && window.top !== window.parent) {
          raw = langFromLocation(window.top.location);
        }
      } catch (e) { raw = null; }
    }
    if (raw) fromUrl = true;
    if (!raw) {
      try { raw = window.localStorage.getItem('kclient.lang'); } catch (e) { raw = null; }
    }
    if (!raw) {
      try { raw = navigator.language; } catch (e) { raw = null; }
    }
    var locale = normalize(raw) || 'en';
    if (fromUrl) {
      // Persist ONLY URL-derived locales: a frame that fell back to
      // navigator.language must never overwrite the durable hint (ADR 0003).
      try { window.localStorage.setItem('kclient.lang', locale); } catch (e) { /* private mode etc. */ }
    }
    return locale;
  }

  var locale = resolveLocale();

  function t(key, vars) {
    var s;
    var dict = DICTS[locale] || DICTS.en;
    if (Object.prototype.hasOwnProperty.call(dict, key)) {
      s = dict[key];
    } else if (Object.prototype.hasOwnProperty.call(DICTS.en, key)) {
      s = DICTS.en[key];
    } else {
      s = key;
    }
    if (vars) {
      s = s.replace(/\{([^{}]+)\}/g, function (m, name) {
        return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : m;
      });
    }
    return s;
  }

  function apply(root) {
    root = root || document;
    var nodes, i, el, key;
    nodes = root.querySelectorAll('[data-i18n]');
    for (i = 0; i < nodes.length; i++) {
      el = nodes[i];
      key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    }
    nodes = root.querySelectorAll('[data-i18n-title]');
    for (i = 0; i < nodes.length; i++) {
      el = nodes[i];
      key = el.getAttribute('data-i18n-title');
      if (key) el.setAttribute('title', t(key));
    }
    nodes = root.querySelectorAll('[data-i18n-placeholder]');
    for (i = 0; i < nodes.length; i++) {
      el = nodes[i];
      key = el.getAttribute('data-i18n-placeholder');
      if (key) el.setAttribute('placeholder', t(key));
    }
  }

  window.I18N = {
    locale: locale,
    t: t,
    apply: apply
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { apply(document); });
  } else {
    apply(document);
  }
})();
