/* Workshop live time-state (P1-P4). Local, no network: compares each session's
   CEST start/end (data-start / data-end, with the +02:00 offset baked in) against
   the device clock.
     - now > end           -> .session--past  (dim to muted grey, via CSS)
     - start <= now <= end  -> .session--live  (reveals its blinking .live-dot, via CSS)
   Re-evaluates every 60s, so a session flips live/past while the page sits open.
   Offline-safe: with JS off, no classes are added and every session renders
   normally, so the offline Freifunk copy is unaffected. No timezone library:
   Date.parse() handles the +02:00 offset and Date.now() is an absolute epoch, so
   the verdict is the same in any viewer's timezone. */
(function () {
  "use strict";

  var sessions = document.querySelectorAll(".session[data-start][data-end]");
  if (!sessions.length) return;

  function paint() {
    var now = Date.now();
    sessions.forEach(function (el) {
      var start = Date.parse(el.getAttribute("data-start"));
      var end = Date.parse(el.getAttribute("data-end"));
      if (isNaN(start) || isNaN(end)) return;        // malformed data: leave as-is
      el.classList.toggle("session--past", now > end);
      el.classList.toggle("session--live", now >= start && now <= end);
    });
  }

  paint();                     // on load
  setInterval(paint, 60000);   // and every 60s, so states flip live during camp
})();
