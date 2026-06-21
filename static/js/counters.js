/* Live mesh counters + recent messages for the splash. Vanilla JS, no framework, no
   deps. Fetches LIVE data from the PotatoMesh dashboard, falling back to the local
   stats.json / messages.json so the offline copy is unaffected (SPEC.md J1/J2/D6).
   Each fetch is bounded by a short AbortController timeout; on timeout/error/CORS-block
   it uses the local file, then leaves the static placeholders / hides the box. Message
   text is rendered via textContent (never innerHTML) — untrusted mesh content. */
(function () {
  "use strict";
  var WINDOW = "week";        // counter time bucket: "hour" | "day" | "week" | "month"
  var REFRESH_MS = 60000;     // poll cadence for counters + messages
  var MAX_MESSAGES = 3;       // how many recent messages to show
  var TIMEOUT_MS = 2500;      // bound each live fetch so the offline copy falls back fast

  // Live dashboard endpoints (J1). Live only when the API returns CORS headers (J3);
  // otherwise the browser blocks the read and we fall back to the local file.
  var STATS_REMOTE = "https://dweb.potatomesh.net/api/stats";
  var STATS_LOCAL  = "stats.json";
  var MSGS_REMOTE  = "https://dweb.potatomesh.net/api/messages?limit=3";
  var MSGS_LOCAL   = "messages.json";

  var nodes = document.getElementById("stat-nodes");
  var msgs = document.getElementById("stat-messages");
  var feed = document.getElementById("latest");
  if (!nodes && !msgs && !feed) return; // only runs on the splash

  function num(v) { return (typeof v === "number" && isFinite(v)) ? String(v) : null; }
  function total(d, metric) { var t = d && d.total && d.total[metric]; return t ? num(t[WINDOW]) : null; }
  function fmtTs(ts) {
    var t = new Date(typeof ts === "number" ? ts * 1000 : Date.parse(ts));
    return isFinite(t.getTime()) ? t.toISOString().replace("T", " ").slice(0, 16) + " UTC" : "";
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text != null) { e.textContent = text; } // textContent: safe against untrusted mesh text
    return e;
  }

  function getJSON(url, signal) {
    return fetch(url, { cache: "no-store", signal: signal }).then(function (r) {
      if (!r.ok) { throw new Error("status " + r.status); }
      return r.json();
    });
  }

  // Remote-first with a bounded timeout, then the local file (offline fallback).
  function liveOrLocal(remoteUrl, localUrl) {
    var ctrl = (typeof AbortController !== "undefined") ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS) : null;
    return getJSON(remoteUrl, ctrl ? ctrl.signal : undefined)
      .then(function (d) { if (timer) { clearTimeout(timer); } return d; })
      .catch(function () { if (timer) { clearTimeout(timer); } return getJSON(localUrl); });
  }

  function refreshCounters() {
    liveOrLocal(STATS_REMOTE, STATS_LOCAL)
      .then(function (d) {
        var n = total(d, "nodes"), m = total(d, "messages");
        if (n !== null && nodes) { nodes.textContent = n; }
        if (m !== null && msgs) { msgs.textContent = m; }
      })
      .catch(function () { /* remote + local both unreachable: keep static placeholders */ });
  }

  function refreshMessages() {
    if (!feed) { return; }
    liveOrLocal(MSGS_REMOTE, MSGS_LOCAL)
      .then(function (list) {
        if (!Array.isArray(list) || !list.length) { feed.textContent = ""; feed.hidden = true; return; }
        // records: { text, protocol, channel_name, rx_time (epoch), ... }
        var recent = list.slice()
          .sort(function (a, b) { return (((b && b.rx_time) || 0) - ((a && a.rx_time) || 0)); })
          .slice(0, MAX_MESSAGES);
        feed.textContent = "";
        recent.forEach(function (m) {
          var item = el("div", "latest-item");
          item.appendChild(el("p", "latest-text", (m && m.text) || ""));
          var meta = el("p", "latest-meta");
          if (m && m.protocol) { meta.appendChild(el("span", "tag tag-proto", m.protocol)); }
          if (m && m.channel_name) { meta.appendChild(el("span", "tag", m.channel_name)); }
          if (m && m.rx_time) { meta.appendChild(el("span", "latest-ts", fmtTs(m.rx_time))); }
          item.appendChild(meta);
          feed.appendChild(item);
        });
        feed.hidden = false;
      })
      .catch(function () { /* remote + local both unreachable: keep whatever is shown */ });
  }

  function refresh() { refreshCounters(); refreshMessages(); }
  refresh();
  setInterval(refresh, REFRESH_MS);
})();
