/* Live schedule sync from pretalx (SPEC T1b/T2/T3/T4). Page-scoped to /workshop/,
   loaded after workshop.js. On load it fetches the pretalx widget JSON (endpoint from
   this script tag's data-endpoint, single-sourced in config.toml) and, for each session
   it can match by its data-talx code, patches the TIMES (data-start/data-end + the
   visible "Day Mon D - HH:MM-HH:MM" text) and, only if the session actually moved venue,
   the ROOM text (via a baked room-id -> normalized-name map that keeps the team venue
   numbers). Titles, summaries, speakers and list order are never touched (times, not
   descriptions).

   Offline-safe: one bounded fetch (~2.5s AbortController). Any failure - offline, a CORS
   block, timeout, bad JSON, an unmatched code - is caught and the hardcoded DOM is left
   exactly as built, so the offline Freifunk copy is unaffected. No timezone library: the
   visible wall-clock time is sliced straight from the ISO +02:00 string (talx's stated
   CEST local time), and the absolute data-start/data-end instants are handed to
   workshop.js, which compares them against Date.now(). After a patch it fires
   "workshop:schedule-updated" so workshop.js repaints past/live at once.

   Untrusted-content safe: every rendered value is written via textContent, never as
   raw markup (the same rule counters.js uses for remote mesh text). */
(function () {
  "use strict";

  var script = document.currentScript;
  var endpoint = script && script.dataset ? script.dataset.endpoint : "";
  if (!endpoint) return;

  var sessions = document.querySelectorAll(".session[data-talx]");
  if (!sessions.length) return;

  // Baked room-id -> normalized name (authoring-time, from the 2026-07-07 reconcile).
  // Keeps the team-supplied venue numbers (Q2/D12) when a session moves venue; an
  // unmapped new id falls back to talx's raw room name with no invented number.
  var ROOM_MAP = {
    "26": "Resilience Base (10)",
    "27": "P2P Portal (11)",
    "31": "Mesh Nest (5)",
    "105": "Hacker's Lab (7)"
  };

  var WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // "2026-07-08T13:00:00+02:00" -> "Wed Jul 8" (weekday from the calendar date, so it is
  // independent of the viewer's timezone; day-of-month has no leading zero).
  function dayLabel(iso) {
    var y = +iso.slice(0, 4), m = +iso.slice(5, 7), d = +iso.slice(8, 10);
    if (!y || !m || !d) return null;
    var wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return WD[wd] + " " + MO[m - 1] + " " + d;
  }

  // wall-clock "HH:MM" taken straight from the ISO string (talx's stated +02:00 time),
  // so it is not shifted into the viewer's own timezone.
  function hhmm(iso) { return iso.slice(11, 16); }

  // "Day Mon D <middot> HH:MM-HH:MM", matching the hardcoded .sess-hi time text.
  function timeText(startIso, endIso) {
    var day = dayLabel(startIso);
    if (!day || startIso.length < 16 || endIso.length < 16) return null;
    return day + " · " + hhmm(startIso) + "-" + hhmm(endIso);
  }

  function apply(data) {
    var talks = data && data.talks;
    if (!talks || !talks.length) return;

    var byCode = {}, i, t;
    for (i = 0; i < talks.length; i++) {
      t = talks[i];
      if (t && t.code) byCode[t.code] = t;
    }

    // raw room-id -> name fallback, for a move to a venue not in ROOM_MAP
    var rawRoom = {}, r;
    if (data.rooms && data.rooms.length) {
      for (i = 0; i < data.rooms.length; i++) {
        r = data.rooms[i];
        if (r && r.id != null && r.name) rawRoom[r.id] = r.name.en || null;
      }
    }

    var changed = false;

    Array.prototype.forEach.call(sessions, function (el) {
      var talk = byCode[el.getAttribute("data-talx")];
      if (!talk || !talk.start || !talk.end) return;   // unmatched -> keep hardcoded

      var spans = el.querySelectorAll(".sess-hi");       // [0] = time, [1] = room
      if (spans.length < 2) return;

      // --- times (and day), if the instants moved ---
      if (talk.start !== el.getAttribute("data-start") ||
          talk.end !== el.getAttribute("data-end")) {
        var txt = timeText(talk.start, talk.end);
        if (txt) {
          el.setAttribute("data-start", talk.start);
          el.setAttribute("data-end", talk.end);
          spans[0].textContent = txt;
          changed = true;
        }
      }

      // --- room, only on a genuine venue move (the numeric id changed) ---
      if (talk.room != null) {
        var newId = String(talk.room);
        if (newId !== el.getAttribute("data-room-id")) {
          var name = ROOM_MAP[newId] || rawRoom[talk.room] || null;
          if (name) {
            spans[1].textContent = name;
            el.setAttribute("data-room-id", newId);
            changed = true;
          }
        }
      }
    });

    if (changed) window.dispatchEvent(new Event("workshop:schedule-updated"));
  }

  // one bounded fetch; any failure leaves the hardcoded DOM untouched
  var ctrl = new AbortController();
  var timer = setTimeout(function () { ctrl.abort(); }, 2500);
  fetch(endpoint, { signal: ctrl.signal })
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) { if (data) apply(data); })
    .catch(function () { /* offline / CORS / timeout / bad JSON -> hardcoded stays */ })
    .then(function () { clearTimeout(timer); });
})();
