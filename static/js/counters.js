/* Live mesh counters for the splash. Vanilla JS, no framework, no deps.
   Fetches a same-origin stats.json written by the Mesh Nest box. On ANY
   failure (file absent, offline, bad JSON) it silently leaves the static
   placeholders in place — no spinner, no error spew. (SPEC.md D6.) */
(function () {
  "use strict";
  var nodes = document.getElementById("stat-nodes");
  var msgs = document.getElementById("stat-messages");
  var updated = document.getElementById("stat-updated");
  if (!nodes && !msgs) return; // only runs on the splash

  function num(v) { return (typeof v === "number" && isFinite(v)) ? String(v) : null; }

  fetch("stats.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) { throw new Error("status"); } return r.json(); })
    .then(function (d) {
      var n = num(d.nodes), m = num(d.messages);
      if (n !== null && nodes) { nodes.textContent = n; }
      if (m !== null && msgs) { msgs.textContent = m; }
      if (d.updated && updated) {
        var t = new Date(d.updated);
        updated.textContent = isFinite(t.getTime())
          ? t.toISOString().replace("T", " ").slice(0, 16) + " UTC"
          : String(d.updated);
      }
    })
    .catch(function () { /* offline-honest: keep the placeholders */ });
})();
