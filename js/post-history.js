(function () {
  "use strict";

  var STORAGE_KEY = "postHistory";
  var NEW_THRESHOLD_MS = 21 * 24 * 60 * 60 * 1000;

  function loadHistory() {
    try {
      return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveHistory(hist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(hist));
    } catch (e) { }
  }

  function isPostNew(id, contentDate, hist) {
    var entry = hist[id];
    if (!entry) return true;
    if (contentDate > entry.contentDate) {
      return true;
    }
    return !!entry.markedNewUntil && entry.markedNewUntil > Date.now();
  }

  function hasAnyNewPost(hist) {
    var now = Date.now();
    var keys = Object.keys(hist);
    for (var i = 0; i < keys.length; i++) {
      var e = hist[keys[i]];
      if (e && !!e.markedNewUntil && e.markedNewUntil > now) return true;
    }
    return false;
  }

  function addBadgeTo(titleEl) {
    var existing = titleEl.querySelector(".new-badge");
    if (existing) existing.remove();
    var badge = document.createElement("span");
    badge.className = "new-badge";
    badge.textContent = " NEW";
    titleEl.appendChild(badge);
  }

  function run() {
    var hist = loadHistory();
    var hasNewPost = false;

    // --- Single post page ---
    var main = document.querySelector("main[data-id][data-date]");
    if (main) {
      var pid = main.getAttribute("data-id");
      var pdate = parseInt(main.getAttribute("data-date"), 10);
      if (pid && pdate) {
        if (!hist[pid]) hist[pid] = {};
        hist[pid].contentDate = pdate;
        hist[pid].visitedAt = Date.now();
        saveHistory(hist);
      }
      hasNewPost = hasAnyNewPost(hist);
      if (hasNewPost) {
        var h1 = main.querySelector("h1");
        if (h1) addBadgeTo(h1);
        var navText = document.querySelector('#patterns-list a[href*="post"] .text');
        if (navText) addBadgeTo(navText);
      }
      return;
    }

    // --- Posts list page ---
    var lis = document.querySelectorAll('li[data-id][data-date]');
    var posts = [];
    for (var i = 0; i < lis.length; i++) {
      var li = lis[i];
      var id = li.getAttribute("data-id");
      var date = parseInt(li.getAttribute("data-date"), 10);
      if (id && date) {
        posts.push({ id: id, contentDate: date, li: li });
      }
    }

    if (posts.length) {
      var latest = null;
      for (var k = 0; k < posts.length; k++) {
        var p = posts[k];
        if (isPostNew(p.id, p.contentDate, hist)) {
          if (!latest || p.contentDate > latest.contentDate) latest = p;
        }
      }

      if (latest) {
        hasNewPost = true;
        if (!hist[latest.id]) hist[latest.id] = {};
        hist[latest.id].markedNewUntil = Date.now() + NEW_THRESHOLD_MS;
      }

      for (var m = 0; m < posts.length; m++) {
        var pp = posts[m];
        if (!hist[pp.id]) hist[pp.id] = {};
        hist[pp.id].contentDate = pp.contentDate;
        hist[pp.id].visitedAt = Date.now();
        if (pp.id !== (latest && latest.id)) {
          hist[pp.id].markedNewUntil = 0;
        }
      }
      saveHistory(hist);

      if (latest) {
        var titleLink = latest.li.querySelector("h2 > a");
        if (titleLink) addBadgeTo(titleLink);
      }
    } else {
      hasNewPost = hasAnyNewPost(hist);
    }

    // Badge nav on all pages if there's a new post
    if (hasNewPost) {
      var navText = document.querySelector('#patterns-list a[href*="post"] .text');
      if (navText) addBadgeTo(navText);
    }
  }

  if (document.readyState !== "loading") {
    run();
  } else {
    document.addEventListener("DOMContentLoaded", run);
  }
})();
