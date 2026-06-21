/* Live mesh counters + recent messages for the splash. Vanilla JS, no framework, no
   deps. Polls same-origin stats.json (counts) and messages.json (recent messages),
   refreshing every 60s. On ANY failure it leaves the last-good values / static
   placeholders in place and the messages box hidden - no spinner, no error spew.
   Message text is rendered via textContent (never innerHTML), so untrusted mesh
   content cannot inject markup. (SPEC.md D6.) */
(function () {
  "use strict";
  var WINDOW = "week";       // counter time bucket: "hour" | "day" | "week" | "month"
  var REFRESH_MS = 60000;    // poll cadence for counters + messages
  var MAX_MESSAGES = 3;      // how many recent messages to show

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

  function refreshCounters() {
    fetch("stats.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) { throw new Error("status"); } return r.json(); })
      .then(function (d) {
        var n = total(d, "nodes"), m = total(d, "messages");
        if (n !== null && nodes) { nodes.textContent = n; }
        if (m !== null && msgs) { msgs.textContent = m; }
      })
      .catch(function () { /* keep last-good / placeholders */ });
  }

  function refreshMessages() {
    if (!feed) { return; }
    fetch("messages.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) { throw new Error("status"); } return r.json(); })
      .then(function (list) {
        if (!Array.isArray(list) || !list.length) { feed.textContent = ""; feed.hidden = true; return; }
        // messages.json records: { text, protocol, channel_name, rx_time (epoch), ... }
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
      .catch(function () { /* offline-honest: keep whatever is already shown */ });
  }

  function refresh() { refreshCounters(); refreshMessages(); }
  refresh();
  setInterval(refresh, REFRESH_MS);
})();
