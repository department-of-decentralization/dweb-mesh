/* Copy-to-clipboard buttons for code blocks. Vanilla JS, no deps, all local. Adds a
   small button to every <pre> that holds a <code> (skips the dynamic provision logs,
   which are <pre> without <code>). Uses the async Clipboard API with an execCommand
   fallback so it also works on the offline, insecure-context Freifunk copy; if neither
   is available, no button is added. (SPEC.md D3 — local only.) */
(function () {
  "use strict";
  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>';

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) { resolve(); } else { reject(new Error("copy failed")); }
      } catch (e) { reject(e); }
    });
  }

  function canCopy() {
    return !!(navigator.clipboard && navigator.clipboard.writeText) ||
      (typeof document.queryCommandSupported === "function" && document.queryCommandSupported("copy"));
  }

  function flash(btn, cls) {
    btn.classList.add(cls);
    setTimeout(function () { btn.classList.remove(cls); }, 1500);
  }

  function add() {
    if (!canCopy()) { return; }
    Array.prototype.forEach.call(document.querySelectorAll("pre"), function (pre) {
      var code = pre.querySelector("code");
      if (!code || pre.querySelector(".copy-btn")) { return; }   // code blocks only, once
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.setAttribute("aria-label", "Copy code");
      btn.innerHTML = ICON;                                       // static, trusted markup
      btn.addEventListener("click", function () {
        copyText(code.textContent).then(function () {
          flash(btn, "copied");
        }).catch(function () {
          flash(btn, "failed");
        });
      });
      pre.classList.add("has-copy");
      pre.appendChild(btn);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", add);
  } else {
    add();
  }
})();
