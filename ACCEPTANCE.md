# ACCEPTANCE — DWeb Camp 2026 Mesh Documentation Site

**Audience:** a reviewer with *zero context* from the build session.
**Source of truth:** this file mirrors and operationalizes the build brief §13 and
`SPEC.md` (decisions D1–D12). Each criterion below is **runnable** — copy the
command, observe the result, tick the box. If a command's "Expect" is not met, the
build **fails** that criterion.

> Format note: there is no prior site in this repo to match, so these criteria
> follow the brief's own §13 acceptance list as the canonical format and expand
> each line into an executable check. Cite: brief §13; `SPEC.md` §1, §2.

---

## 0. Prerequisites (run once)

```sh
# Zola installed (D1). Any 0.19+ is fine.
zola --version            # Expect: zola 0.19.x or newer

# Build to the static output dir.
zola build                # Expect: exit 0; writes ./public/

# Serve the OUTPUT offline, at site root (mirrors Freifunk + GH Pages).
( cd public && python3 -m http.server 8000 )   # then browse http://localhost:8000/
```

**Offline-render note (D2):** the site uses `base_url = "/"` → host-less
root-absolute paths (`/css/…`). Verify offline by **serving `public/` at root**
(command above) with networking disabled — this mirrors the real deploy. A bare
`file://` double-click is *not* the supported path under `base_url="/"` (absolute
paths resolve to the filesystem root); this is an accepted consequence of D2.
The "no internet" half of brief §13.3 is what's tested, via the root server.

---

## 1. Builds with Zola → static output  *(brief §13.1)*

- **Verify:** `zola build`
- **Expect:** exit 0; `public/index.html` exists; no `ERROR`/`WARN` about missing
  templates, broken internal links, or unresolved assets.
- [ ] Pass

## 2. Zero external **asset** references  *(brief §13.2; D3)*

External *assets* (auto-fetched: CSS, JS, fonts, images, iframes, analytics) are
**forbidden**. External *hyperlinks* (`<a href>`: the Matrix link, device "where to
buy", cited sources) are **allowed** — they are click-throughs, not page assets.

> **Amended by Feature: Site Structure → G4:** exactly **one** external asset is now
> allowed — the `<iframe src="https://flasher.meshcore.io">` on `/flash` (the web
> flasher is online-only by nature). The carve-out is **scoped to that one host on
> `/flash`**; every other external asset stays forbidden. `check-offline.sh` is amended
> to allow precisely this and still fail on anything else (verified by **SS-9**).
>
> **Further amended by Feature: Intel page → N2:** a **second** external asset is now allowed —
> the `<iframe src="https://meshint.potatomesh.net/?d=dweb.potatomesh.net">` on `/intel` (the
> mesh-intel viewer is online-only by nature). Two scoped carve-outs now exist — `flasher.meshcore.io`
> on `/flash` and `meshint.potatomesh.net` on `/intel`, **each scoped to its one page**; every other
> external asset stays forbidden. `check-offline.sh` allows precisely these two and still fails on
> anything else (verified by **SS-9** + **IN-3**).

Scans target only browser-loaded files (`*.html *.css *.js *.svg *.xml`). Prose
docs (`*.md`/`*.txt` — bundled font licenses & `SOURCES.md`) may legitimately name
a host (an OFL license cites `scripts.sil.org`) and are exempt. The canonical gate
is `scripts/check-offline.sh`; the greps below are the same checks, by hand.

```sh
INC="--include=*.html --include=*.css --include=*.js --include=*.svg --include=*.xml"

# (a) No external assets (script/link/img/source/video/audio/iframe/embed):
grep -rEoin $INC '<(link|script|img|source|video|audio|iframe|embed)\b[^>]*\b(src|href)=["'"'"']https?://' public/
#   Expect: ONLY the two carve-outs — flasher.meshcore.io under public/flash/ (G4) and
#           meshint.potatomesh.net under public/intel/ (N2); nothing else.

# (b) No external CSS imports / url():
grep -rEin $INC '(@import|url\()\s*["'"'"']?https?://' public/
#   Expect: NO output.

# (c) No analytics / tracking / CDN hosts:
grep -rEin $INC 'google-analytics|googletagmanager|gtag|plausible|matomo|fonts\.(googleapis|gstatic)|cdnjs|jsdelivr|unpkg|cloudflare' public/
#   Expect: NO output.

# (d) Inventory external hyperlinks for human review (must be intentional):
grep -rEohin --include=*.html '<a\b[^>]*href=["'"'"']https?://[^"'"'"']*' public/ | sort -u
#   Expect: ONLY matrix.to (footer), device vendor buy links, dated source citations.

# Canonical gate (run this):
scripts/check-offline.sh
#   Expect: OK: no external asset references in 'public'.
```
- [ ] Pass

## 3. Renders fully with no internet  *(brief §13.3; D2/D4)*

- **Verify:** with the root server running and **networking disabled**, load every
  route (see §6). Open browser devtools → Network.
- **Expect:** every page styled with the **bundled fonts** (pixel display + mono
  body); no 404s for CSS/font/JS/img; **no request leaves `localhost`**.
  *(Amended by G4 + N3: `/flash` embeds the online-only `flasher.meshcore.io` iframe and
  `/intel` embeds the online-only `meshint.potatomesh.net` iframe — neither loads offline,
  which is accepted; the rest of those pages (incl. `/intel`'s header + footer) and every
  other page still render fully offline with no other external request.)*
- [ ] Pass

## 4. Links resolve at root (and subpath via the base_url switch)  *(brief §13.4; D2)*

```sh
# Internal nav/asset refs are host-less root paths (carry no domain):
grep -rEoin 'href=["'"'"']https?://mesh\.dod\.ngo' public/    # Expect: NO output (links are "/…", not absolute-with-host)

# Subpath capability (the D2 switch) actually works:
zola build --base-url /dweb-mesh/ -o public_sub
grep -rEoq 'href="/dweb-mesh/' public_sub && echo "subpath OK"   # Expect: subpath OK
rm -rf public_sub
```
- **Also:** on the root server, click through the full nav from `/` — every link 200s.
- [ ] Pass

## 5. Footer on every page  *(brief §13.5; D7)*

```sh
# Every HTML page mentions the tent-5 location (case-insensitive; footer renders "TENT 5"):
grep -riL "tent 5" public/ --include='*.html'     # Expect: NO output (every file matches)

# The Matrix fallback link is present and correct:
grep -rEoq 'href="https://matrix\.to/#/#dweb-mesh:dod\.ngo"' public/ && echo "matrix OK"   # Expect: matrix OK
```
- **Expect:** every page carries Mesh Nest / tent 5 + the working Matrix link.
  *(Amended by Feature: Landing Page Structure → F4: the "when LoRa fails, this is
  how you reach a human" framing is no longer required; the footer is the compact
  four-item row. The two grep checks above are unchanged and still authoritative.)*
- [ ] Pass

## 6. All site-map routes exist and route correctly  *(brief §13.6; SPEC §2)*  — *[superseded by Site Structure → SS-1]*

> Superseded by **G1**: the 17-route three-stack map is replaced by the flat 7-page
> IA. Evaluate routes via **SS-1** (7 present + the 8 old paths gone). The original
> 17-route loop is retired — it references pages deleted by G1.
- [ ] Pass — via **SS-1**

## 7. Meshtastic "no services" + stacks parallel, no bridges  *(brief §13.7; D8)*  — *[superseded by Site Structure → SS-2]*

> Superseded by **G2**: the stacks are de-paged. The "no services" + "no bridge"
> facts now live in the **/start note** and are checked by **SS-2** (the old per-stack
> greps target deleted dirs).
- [ ] Pass — via **SS-2**

## 8. Splash counters read `stats.json` + graceful fallback  *(brief §13.8; D6)*

- **Verify A (present):** with committed `stats.json` served at root, load `/` →
  node + message counters show the file's numbers.
- **Verify B (absent/unreachable):** rename it (`mv public/stats.json public/_stats.json`),
  reload `/` → a **static placeholder** shows. **No** infinite spinner, **no**
  console error spew, **no** hang. Restore the file afterward.
- **Expect:** both behaviors; the JS is local, tiny, framework-free.
- **Recent-messages box (extends D6):** the splash renders a muted-blue box under the counters showing the **last 3** messages from `messages.json` (an array of mesh records `{text, protocol, channel_name, rx_time, …}`; sorted by `rx_time`, newest first; each = text + protocol & channel-name tags + timestamp). Message text is injected via `textContent` (safe vs untrusted mesh input). Counters (`stats.json`) and messages (`messages.json`) **refresh every 60 s**; both fail soft (box hidden when absent/empty/offline). Counter window is `week`. *(messages.json shape is the assumed Mesh-Nest contract — team to confirm.)*
- [ ] Pass

## 9. TBC fields are visible placeholders, not invented data  *(brief §13.9; D12)*  — *[superseded by Site Structure → SS-5/SS-6]*

> Superseded by **G1/G5**: `/settings/` is deleted. TBC discipline now applies to
> `/workshop` (content TBC — **SS-6**) and the `/config` preset (looked-up + **cited**
> + "verify before camp", not invented — **SS-5**); no PSK is fabricated anywhere.
- [ ] Pass — via **SS-5 / SS-6**

## 10. A disinterested reviewer can confirm 1–9 alone  *(brief §13.10)*

- **Verify:** a fresh reviewer runs §0–§9 using only this file and reaches a verdict
  with **no** input from the author.
- [ ] Pass

---

## Supplemental criteria (from SPEC — also load-bearing)

| # | Criterion | Verify | Expect |
|---|-----------|--------|--------|
| **S1** | Fonts bundled + local (D4) | `ls public/fonts/` ; `grep -rE '@font-face' public/ -l` | ≥2 `woff2` in repo; `@font-face` `url()` are local paths |
| **S2** | Small payload (D3) | `du -sh public/ ; du -sh public/fonts/` | Total in low MB; fonts subset, not multi-MB |
| **S3** | No node toolchain in repo (D1) *[amended by H2, P1]* | `! test -e package.json ; ! test -d node_modules ; find public -name '*.js'` | NO `package.json`/`node_modules` in the repo; JS = hand-written + the **vendored** lib: `counters.js`, `copy-code.js`, `mesh-provision.js`, `workshop.js` (page-scoped, `/workshop` only — P1), `vendor/meshcore.min.js` — all local (governs the JS inventory; see **WS-1/WS-2/WT-1**) |
| **S4** | Stack hierarchy stated (D8 → G2) | grep `public/start/` | Meshcore PRIMARY + Meshtastic SUPPORTED (no services) + Reticulum EDUCATIONAL/→Workshop stated in the **/start note** (no stack pages) — see **SS-2** |
| **S5** | AI host = a channel, not a route (D9 → G3) | `! test -e public/meshcore/services` ; grep `public/config/` | no services route; AI host is the `#bot` channel line on `/config` — see **SS-5** |
| **S6** | CNAME + CI present (D10) | `cat CNAME ; ls .github/workflows/` | `CNAME` = `mesh.dod.ngo`; a workflow builds Zola → Pages; Freifunk noted manual |

---

## Feature: Landing Page Structure  *(SPEC.md → Feature: Landing Page Structure, F1–F4)*

Added 2026-06-20. A zero-context reviewer judges the landing shell with **LP-1…LP-7**
below, **in addition to** §1–§10 and S1–S6 (regression line at the end). Build first
(`zola build`), then serve `public/` at root per §0.

### LP-1 — Collapsible nav is CSS-only  *(F1; D3)*  *[amended by H2]*
```sh
grep -Eic 'type=["'"'"']?checkbox' public/index.html   # Expect: >=1 (nav toggle is a checkbox, not JS)
grep -c 'nav-toggle' public/index.html                 # Expect: >=1 (the CSS checkbox toggle)
# The nav adds NO script of its own. Page-specific scripts are the splash counter
# (index.html) + /config provisioning; copy-code.js is injected SITE-WIDE via the base
# template (CC-1), so every page legitimately carries a <script>. The authoritative JS
# inventory is governed by S3 + WS-2 — not this grep. Here, verify the nav/header
# itself stays pure CSS (checkbox + label, no JS), which CC-1 does not affect:
awk '/<header/,/<\/header>/' public/index.html | grep -c '<script'  # Expect: 0 (no <script> inside the header/nav)
```
- **Expect:** the nav collapse is a hidden checkbox + CSS — **no nav JavaScript**. (The site-wide JS-count moved to amended **S3** + **WS-2**, since the WebSerial feature legitimately adds `/config` JS.)
- [ ] Pass

### LP-2 — Nav responsive: inline wide, logo-toggled menu narrow  *(F1)*
- **Verify:** on the root server, load any page at a **wide** viewport → all nav items show inline and the `DWEB·MESH` brand links to `/`. Shrink **below** the collapse width → nav items hide; activating the **logo** reveals the menu; the menu includes a **HOME** entry routing to `/`.
- **Expect:** both states; no horizontal overflow when narrow; brand = home link wide, = toggle narrow.
- [ ] Pass

### LP-3 — Nav toggle keyboard-operable and offline  *(F1; D3)*
- **Verify:** networking disabled, narrow viewport: Tab to the toggle, press Space/Enter → menu opens/closes. Devtools Network shows **no** request from the header.
- **Expect:** keyboard works; zero network.
- [ ] Pass

### LP-4 — Splash trimmed to the funnel  *(F2)*
```sh
grep -c  'splash-sub'         public/index.html   # Expect: 0 (DWEB CAMP/LoRa/OFFLINE-FIRST sub-line removed; note: 'Offline-first' legitimately remains in the <meta description>)
grep -ic 'SYNC'               public/index.html   # Expect: 0 (LAST SYNC line removed)
grep -c  'START HERE'         public/index.html   # Expect: 0 (CTA renamed to START)
grep -ic 'JOIN'               public/index.html   # Expect: >=1 (JOIN THE MESH kept)
grep -c  'id="stat-nodes"'    public/index.html   # Expect: 1 (node counter kept)
grep -c  'id="stat-messages"' public/index.html   # Expect: 1 (message counter kept)
```
- **Expect:** JOIN THE MESH + node/message counters stay; the sub-line, LAST SYNC, and "HERE" are gone; CTA reads **START**.
- [ ] Pass

### LP-5 — BUY DEVICE external hyperlink  *(F3; extends §2d)*
```sh
grep -Eo 'href=["'"'"']https://dwebcamp\.org/tickets' public/index.html   # Expect: present
scripts/check-offline.sh                                                  # Expect: OK (no external ASSET)
# §2(d) external-link inventory now allows exactly: matrix.to, device vendor links, citations, dwebcamp.org/tickets:
grep -rEohin --include=*.html '<a\b[^>]*href=["'"'"']https?://[^"'"'"']*' public/ | sort -u
```
- **Expect:** BUY DEVICE points to `https://dwebcamp.org/tickets`; it is a hyperlink, not an asset; `check-offline.sh` still passes; the only **new** external-link inventory entry is `dwebcamp.org/tickets`.
- [ ] Pass

### LP-6 — Single-line footer, four items, D7 amended  *(F4)*
```sh
grep -ic 'dweb-mesh:dod.ngo' public/index.html   # Expect: >=1 (Matrix)
grep -ic 'tent 5'            public/index.html    # Expect: >=1 (Mesh Nest)
grep -c  '#dwebcamp'         public/index.html    # Expect: >=1 (Meshcore channel)
grep -ic 'potatomesh'        public/index.html    # Expect: >=1 (Dashboard)
grep -ric 'when LoRa fails'  public/              # Expect: 0  (D7 phrasing dropped EVERYWHERE)
# §5 regression still holds (footer on every page):
grep -riL 'tent 5' public/ --include='*.html'                                   # Expect: NO output
grep -rEoq 'href="https://matrix\.to/#/#dweb-mesh:dod\.ngo"' public/ && echo OK # Expect: OK
```
- **Expect:** footer carries Matrix · Tent 5 (Mesh Nest) · Meshcore #dwebcamp · Dashboard on **every** page; the old phrasing appears nowhere; tent 5 + Matrix link still on every page.
- [ ] Pass

### LP-7 — Footer responsive  *(F4)*
- **Verify:** on the root server, **wide** viewport → the four items render on a **single row** with vertical-line separators between them. **Narrow** viewport → they wrap to **at most four stacked lines**.
- **Expect:** one row wide; ≤4 lines narrow.
- [ ] Pass

### Regression — prior criteria still pass
All of **§1–§10 and S1–S6 must still pass** after this feature. Specifically at risk:
- **§5 (footer):** rewritten — keeps `tent 5` + the exact Matrix href on every page; **§5 is amended** (note added there) to drop the "when LoRa fails…" framing requirement.
- **S3 (no extra JS):** the nav adds **no** JS file (LP-1).
- **§2 / §2(d):** no new asset; the only new external hyperlink is BUY DEVICE (LP-5).
- **§8 (counters):** still read `stats.json` / degrade gracefully after the LAST SYNC line is removed (LP-4 keeps the counter elements).
- [ ] Pass (no regression in §1–§10, S1–S6)

---

## Feature: Site Structure (flat 7-page IA)  *(SPEC.md → Feature: Site Structure, G1–G6)*

Added 2026-06-20. A zero-context reviewer judges the restructure with **SS-1…SS-9**,
**in addition to** the surviving §/S/LP criteria (regression line at end). Prior
criteria **superseded** (§6→SS-1, §7→SS-2, §9→SS-5/6, S4→SS-2, S5→SS-5); §2/§3 are
**amended** (G4 flasher carve-out). Build first: `zola build`.

### SS-1 — Flat 8-page IA; old hierarchy gone  *(G1)*  *[amended by N1: +/intel/]*
```sh
for p in "" start hardware flash config intel workshop contact ; do
  test -f "public/${p:+$p/}index.html" && echo "OK  /$p/" || echo "MISSING /$p/"
done            # Expect: 8 lines, all OK  (INTEL added by N1, between CONFIG and WORKSHOP)
for d in settings devices meshcore meshtastic reticulum mesh-nest agenda about ; do
  test -e "public/$d" && echo "STALE /$d/" || echo "gone /$d/"
done            # Expect: 8 lines, all "gone"
```
- **Expect:** the 8 routes exist (INTEL between CONFIG and WORKSHOP); the 8 pre-restructure paths are still deleted; build is clean (§1); every internal nav/footer `get_url` resolves (no broken link).
- [ ] Pass

### SS-2 — /start: 4-CTA sitemap + relocated stack note  *(G1/G2)*
```sh
grep -Eo 'href="/(hardware|flash|config|contact)/"' public/start/index.html | sort -u  # Expect: all four
grep -iE 'no services' public/start/index.html      # Expect: present
grep -iE 'bridge'      public/start/index.html      # Expect: present ("don't bridge")
grep -iE 'meshtastic|mediumfast|reticulum' public/start/index.html   # Expect: all three named
```
- **Expect:** exactly 4 action items (Hardware/Flash/Config/Contact) + a note stating Meshtastic supported (Router on MediumFast), no services, no bridge, Reticulum→Workshop, with the three terms highlighted.
- [ ] Pass

### SS-3 — /hardware  *(G1/G5/G6)*
```sh
grep -c 'class="device"' public/hardware/index.html         # Expect: 3 cards
grep -ioE 'spec:' public/hardware/index.html | head -1      # Expect: present (Spec: prefix)
grep -Eo 'https://dwebcamp\.org/tickets/?"[^>]*target="_blank"' public/hardware/index.html  # Expect: BUY DEVICES, new tab
grep -iE '868|500 ?mw' public/hardware/index.html           # Expect: 868 MHz / 500 mW warning
```
- **Expect:** 3 cards with `Spec:` vendor links; external antenna noted on the Thinknode; the 868 MHz/500 mW warning; a centered BUY DEVICES button → tickets (new tab). *(Manual: the two stray nodes + closing paragraph are gone.)*
- [ ] Pass

### SS-4 — /flash  *(G4)*
```sh
grep -Eo '<iframe[^>]*src="https://flasher\.meshcore\.io' public/flash/index.html   # Expect: present (the ONE allowed asset)
grep -Eo 'flasher\.meshcore\.io[^"]*"[^>]*target="_blank"'  public/flash/index.html # Expect: fallback link, new tab
grep -Eo 'href="/(config|contact)/"' public/flash/index.html | sort -u             # Expect: → Config and → Contact
```
- **Expect:** the 5 steps render; the flasher iframe is the only external asset on the page; a fallback "open flasher" link + a "needs internet" note; onward links to Config and Contact.
- [ ] Pass

### SS-5 — /config: preset + channels + AI-host channel  *(G3/G5)*
```sh
grep -iF 'EU/UK (Narrow)' public/config/index.html          # Expect: preset name
grep -E '869\.618|62\.5 kHz|SF 8' public/config/index.html  # Expect: the team-confirmed EU/UK (Narrow) values (G5 amended — citation/verify note removed at the team's request)
grep -c '#dwebcamp' public/config/index.html                # Expect: >=1
grep -c '#bot'      public/config/index.html                # Expect: >=1 (AI host, ex-D9)
grep -ic 'de-bebb'  public/config/index.html                # Expect: >=1 (scope)
grep -Eo 'href="https?://[^"]*"[^>]*target="_blank"' public/config/index.html | wc -l  # Expect: >=1 (app/CLI links, new tab)
```
- **Expect:** EU/UK (Narrow) preset box with the **team-confirmed** values (G5 amended — citation/verify note removed at the team's request); a channel box with all 6 `#channels` + scope `de-bebb` (incl. `#bot`); SET PRESET / ADD CHANNELS buttons present (now wired client-side — see WS-3/WS-6); iOS/Android/MeshCLI links in new tabs.
- [ ] Pass

### SS-6 — /workshop  *(G1)*  — *[amended by Workshop session details → WK-1…WK-4]*
> **Amended by L1–L4 (2026-06-24):** `/workshop/` is no longer *"titles + metadata only,
> content TBC, no links."* The four sessions are now **scheduled + sourced**, each with an
> external talx link — judge `/workshop/` via **WK-1…WK-4** below. The original assertions
> (`grep TBC` ≥1; the manual "no links inside the workshop content") are **retired**: they
> describe the pre-L1 page and now invert (links are *expected* — the four talx ones). The
> facts they protected survive — **no invention** as **WK-2** (every value traces to its talx
> link) and **TBC discipline for any future *unscheduled* session** as **WK-4**.
- [ ] Pass — via **WK-1…WK-4**

### SS-7 — /contact  *(G1)*
```sh
grep -iE 'mesh nest|tent 5' public/contact/index.html       # Expect: present
grep -Eo 'https://dod\.ngo[^"]*"[^>]*target="_blank"' public/contact/index.html  # Expect: DoD link, new tab
grep -ic '#berlinmesh' public/contact/index.html            # Expect: >=1 (support channel)
grep -ic 'potatomesh'  public/contact/index.html            # Expect: >=1 (dashboard)
grep -ic 'dweb-mesh:dod.ngo' public/contact/index.html      # Expect: >=1 (Matrix)
grep -iE 'DDG|Goerli Dezentral|Charlottenburg' public/contact/index.html   # Expect: Impressum block
```
- **Expect:** Mesh Nest/Tent 5 note; DoD link (dod.ngo, new tab); `#berlinmesh` support (distinct from the footer's public `#dwebcamp`); dashboard + Matrix; the §5 DDG Impressum verbatim.
- [ ] Pass

### SS-8 — External links open in a new tab  *(G6)*
```sh
grep -rEoh '<a\b[^>]*href="https?://[^"]*"[^>]*>' public/ --include='*.html' | grep -v 'target="_blank"'  # Expect: NO output
```
- **Expect:** no external `<a>` lacks `target="_blank"` (footer Matrix/dashboard included). Internal `/…` links unaffected.
- [ ] Pass

### SS-9 — The flasher carve-out is SCOPED, not a blanket disable  *(G4)*
```sh
scripts/check-offline.sh                       # Expect: OK (passes WITH the flasher iframe)
# Prove it still catches other external assets: plant one, re-run, expect FAIL, then rebuild to discard.
printf '<img src="https://evil.example/x.png">' >> public/flash/index.html
scripts/check-offline.sh ; echo "exit=$?"      # Expect: FAIL (non-zero)
zola build                                     # rebuild → planted asset gone
```
- **Expect:** `check-offline.sh` passes with the legitimate flasher iframe but still FAILS on any other external asset (even on `/flash`). The allowlist is **two scoped hosts** — flasher on `/flash` (G4) and meshint on `/intel` (N2, see **IN-3**) — **not a global off-switch**; this check proves the `/flash` scope, IN-3 proves the `/intel` scope.
- [ ] Pass

### Regression — surviving prior criteria still pass
**Still must pass unchanged:** §1, §4, §5, §8, §10, S1, S2, S3, S6, LP-1–LP-7.
- **§5 / LP-6 (footer):** holds after the Tent-5 link repoint `/mesh-nest/`→`/contact/` (tent 5 text + Matrix link retained).
- **S3 (no extra JS):** new pages add no JS (buttons are non-functional placeholders; the flasher is an iframe, not our JS).
- **§4 (links):** nav/footer link only to the 7 routes; subpath build still works.
**Amended (not regressions):** §2 + §3 (G4 carve-out). **Superseded:** §6→SS-1, §7→SS-2, §9→SS-5/6, S4→SS-2, S5→SS-5.
- [ ] Pass (no regression in the surviving criteria)

---

## Feature: WebSerial Provisioning (companion config)  *(SPEC.md → Feature: WebSerial Provisioning, H1–H4)*

Added 2026-06-21. Judges the `/config` provisioning wiring with **WS-1…WS-6**, in addition
to the surviving criteria. **Auto-verifiable here:** WS-1–WS-5 (build, offline, local-asset,
page wiring, JS values/structure). **WS-6 is MANUAL** — needs a USB companion + Chromium,
not automatable. Build first: `zola build`.

### WS-1 — Library is vendored LOCAL, no CDN  *(H2; D3)*
```sh
test -f public/js/vendor/meshcore.min.js && echo "vendored present"            # Expect: present
grep -rEn 'import[^;]*["'"'"']https?://|from[^;]*["'"'"']https?://' public/js/   # Expect: NO output (no external ESM imports)
grep -rEn 'fetch\(["'"'"']https?://|importScripts\(' public/js/                  # Expect: NO output (no runtime remote loads)
scripts/check-offline.sh                                                         # Expect: OK
```
- **Expect:** `meshcore.min.js` committed under `public/js/vendor/`, imported by relative path; no external import / remote load in any shipped JS; `check-offline.sh` OK. (Incidental URL *strings* inside the vendored bundle are inert — the gate flags asset/import URLs, not strings.)
- [ ] Pass

### WS-2 — No node toolchain entered the repo  *(H2; D1)*  *[amended by P1: +workshop.js]*
```sh
! test -e package.json && ! test -e package-lock.json && ! test -d node_modules && echo "repo node-free"   # Expect: repo node-free
find public -name '*.js' | sort   # Expect: copy-code.js, counters.js, mesh-provision.js, vendor/meshcore.min.js, workshop.js  (5 — workshop.js added by P1)
```
- **Expect:** no `package.json`/`node_modules` in the repo; `zola build` alone produced the site; the JS inventory is exactly those five local files (incl. the page-scoped `workshop.js`, P1).
- [ ] Pass

### WS-3 — /config page wiring  *(H1/H4)*
```sh
grep -Eo 'id="btn-(preset|channels)"' public/config/index.html | sort -u   # Expect: both button ids
grep -Eo 'id="out-(preset|channels)"' public/config/index.html | sort -u   # Expect: both per-button log terminals
grep -c '<script type="module"' public/config/index.html                   # Expect: >=1 (imports mesh-provision.js)
grep -F 'USB companion nodes only, in a Chromium browser over HTTPS. On a phone or over Bluetooth, use the MeshCore app.' public/config/index.html   # Expect: the verbatim muted note
```
- **Expect:** two id'd buttons; a **per-button log terminal** under each (`out-preset`/`out-channels`, hidden until that button is clicked); the verbatim WebSerial muted note; and a module script wiring `mesh-provision.js`.
- [ ] Pass

### WS-4 — Feature-detect / disabled-state (static)  *(H4)*
```sh
grep -c 'navigator.serial' public/config/index.html public/js/mesh-provision.js     # Expect: present (feature-detect)
grep -Ei 'disabled|unsupported' public/config/index.html public/js/mesh-provision.js  # Expect: disables buttons + shows unsupported line when navigator.serial absent
```
- **Expect:** absence of `navigator.serial` disables both buttons and shows an "unsupported browser" line (static review of the wiring; runtime is WS-6/MANUAL).
- [ ] Pass

### WS-5 — Exact provisioning values & safe flow (static)  *(H3)*
```sh
grep -E 'freq: ?869618' public/js/mesh-provision.js    # Expect: freq 869618
grep -E 'bw: ?62500'     public/js/mesh-provision.js    # Expect: bw 62500
grep -E 'sf: ?8\b'       public/js/mesh-provision.js    # Expect: sf 8
grep -E 'cr: ?8\b'       public/js/mesh-provision.js    # Expect: cr 8
grep -E 'tx: ?22\b'      public/js/mesh-provision.js    # Expect: tx 22
grep -nE 'setTxPower\( *27|tx: ?27|27 ?dBm' public/js/mesh-provision.js  # Expect: NO output (27 is rejected by the device)
grep -F 'getHashtagRegionKey' public/js/mesh-provision.js ; grep -F '"de-bebb"' public/js/mesh-provision.js  # Expect: scope key from getHashtagRegionKey("de-bebb"), persisted via CMD 63 (see WS-7)
for k in b8769b859a18cb47fa326c79bc04e2da 03a5bab42c9d3535b69f259f338be9ea 3862ef52df5e5966eb10751b83788bc5 eb50a1bcb3e4e5d7bf69a57c9dada211 c5ead1d8a7647a63fd37d156cdc3e257 625ff2a308bbe3a4c90da77979b7a4fc; do grep -qF "$k" public/js/mesh-provision.js && echo "ok $k" || echo "MISSING $k"; done   # Expect: all 6 ok
grep -nE 'reboot\(' public/js/mesh-provision.js        # Expect: only inside a comment (reboot left commented)
grep -c 'getSelfInfo' public/js/mesh-provision.js      # Expect: >=1 (preset flow queries device info for the name step)
grep -c 'setAdvertName' public/js/mesh-provision.js    # Expect: >=1 (sets the node name)
grep -F '"DWeb "' public/js/mesh-provision.js          # Expect: present (rename prefix, applied only if the name is still the default pubkey-hex)
grep -c 'sendFloodAdvert' public/js/mesh-provision.js        # Expect: >=1 (advert after configuring)
grep -c 'sendChannelTextMessage' public/js/mesh-provision.js # Expect: >=1 (post "flashed <name>" to #bot, advert first)
grep -Ei 'localStorage|sessionStorage' public/js/mesh-provision.js   # Expect: NO output
grep -Ei "'set radio'|set_channel|region put|\"reboot\"" public/js/mesh-provision.js   # Expect: NO text-CLI strings
```
- **Expect:** exact preset (`869618/62500/8/8/22`, never `27`), `de-bebb` scope **persisted** via CMD 63 (key = `getHashtagRegionKey("de-bebb").slice(0,16)`) plus a 2-byte path-hash prefix via CMD 61 (see WS-7), the six channel secrets in slots 1–6 (slot 0 untouched), `reboot()` commented, no text CLI, no storage. The preset flow also queries `getSelfInfo` and **renames an unnamed node** (default = its public-key hex, e.g. `3DAC71E2`) to `DWeb <first-4-hex>` via `setAdvertName`, leaving a user-set name alone. After the channels, it sends an advert (`sendFloodAdvert`) then posts `flashed <name>` to `#bot` (`sendChannelTextMessage`) — advert first, message last — for live flashing-team feedback.
- [ ] Pass

### WS-6 — Device provisioning works  *(H1/H3 — MANUAL: USB companion + Chromium)*
- **Verify (manual):** over HTTPS or `localhost` in a Chromium browser with a `companion_radio_usb` node on USB:
  1. **Set preset** → serial-port picker opens; the button's log terminal opens and shows radio/tx/scope/name steps; a fresh `getSelfInfo` reports **869.618 MHz, 62.5 kHz, SF8, CR 4/8, tx 22 dBm**, and the node is **renamed to `DWeb <first-4-hex>`** if it was still default (e.g. `3DAC71E2` → `DWeb 3DAC`; a user-set name is preserved); all `Ok`.
  2. **Add channels** → its log terminal shows `slot 1..6`, then `advert sent` + `posted to #bot: flashed <name>`; `getChannel(1..6)` returns the six names + secrets, **slot 0 unchanged**, and the `flashed <name>` post appears in `#bot` on another node.
  3. A failed step is surfaced **with the step name** in that button's terminal; the port is **closed** after each run (next click works).
- [ ] Pass (MANUAL)

### WS-7 — Preset persists the flood scope + sets the path-hash prefix  *(bugfix 2026-06-21)*
The RAM-only `setFloodScope` (CMD 54, lost on reboot) is replaced by the **persisted**
default-flood-scope command (CMD 63, device `savePrefs`), and a **2-byte path-hash
prefix** (CMD 61, mode 1) is set.
```sh
grep -c 'setFloodScope'           public/js/mesh-provision.js   # Expect: 0 (RAM-only CMD 54 call removed)
grep -c 'SET_DEFAULT_FLOOD_SCOPE' public/js/mesh-provision.js   # Expect: >=1 (persisted CMD 63 frame [63][31B name \0-pad][16B key])
grep -c 'SET_PATH_HASH_MODE'      public/js/mesh-provision.js   # Expect: >=1 (CMD 61 frame [61][0][1])
```
- **Expect:** no RAM-only `setFloodScope` call; CMD 63 sent (48-byte frame; key = `getHashtagRegionKey("de-bebb").slice(0,16)` = `99e4…`, verified) and CMD 61 sent (path-hash mode 1), each awaiting `Ok`. **MANUAL (hardware):** after Set preset, **reboot the companion → the `de-bebb` scope still set** (the original bug: it was lost).
- [ ] Pass

### Regression — surviving prior criteria still pass
**Amended:** **S3** (allows the vendored lib + provisioning JS; repo still node-free) and **LP-1** (rescoped to "nav adds no JS"). **Still must pass:** §1, §2/§3 (the only external **asset** remains the `/flash` iframe; the provisioning lib is **local**), §4, §5, §8, §10, S1, **S2** (vendored bundle keeps payload low-MB), S6, LP-2–LP-7, SS-1–SS-9 (SS-5's buttons are now wired; its checks still hold).
- [ ] Pass (no regression in the surviving criteria)

---

## Feature: Cross-stack config reference — Meshtastic + Reticulum  *(I1–I6)*

### CR-1 — Two default-collapsed sections after Apps  *(I1)*
`/config` ends with two native `<details>` (Meshtastic, then Reticulum), **default collapsed**, after `## Apps`. No new JS.
```sh
grep -c '<details' public/config/index.html                 # Expect: 2
grep -Ec '<details[^>]*\bopen\b' public/config/index.html   # Expect: 0 (collapsed by default)
grep -E '<summary[^>]*>[^<]*Meshtastic' public/config/index.html  # Expect: present
grep -E '<summary[^>]*>[^<]*Reticulum'  public/config/index.html  # Expect: present
ls static/js/*.js   # Expect: counters.js, copy-code.js, mesh-provision.js, workshop.js (workshop.js added by P1; the <details> add no JS of their own; copy-code.js is the separate copy-button feature)
```
- **Expect:** both sections present, collapsed, ordered Meshtastic→Reticulum, after Apps; no JS added.
- [ ] Pass

### CR-2 — Meshtastic: local QR wrapped in its import link  *(I2; upholds §2)*
The QR is served **locally** via a relative path; the `<img>` is wrapped in the `meshtastic.org/e/?add=true#…` import link (new tab); alt text names the DWeb Camp Meshtastic preset/channels; the Codeberg `berlin.yml` link is present (new tab).
```sh
test -f public/img/meshtastic-berlin.png && echo ok                          # Expect: ok (served from static/img)
grep -E '<img[^>]+src="\.\./img/meshtastic-berlin\.png"' public/config/index.html  # Expect: relative local img
grep -E '<img[^>]+alt="[^"]*Meshtastic[^"]*DWeb' public/config/index.html     # Expect: descriptive alt
grep -F 'meshtastic.org/e/?add=true' public/config/index.html                # Expect: import link present
grep -E 'codeberg\.org/berlinmesh/meshtastic[^"]*"[^>]*target="_blank"' public/config/index.html  # Expect: berlin.yml link, new tab
grep -nE '<img[^>]+src="https?://' public/config/index.html                  # Expect: NO output (no external image)
```
- **Expect:** QR is a local relative `<img>` (no `https` image), wrapped in the import link, descriptive alt, + Codeberg link new-tab; `check-offline.sh` still passes.
- [ ] Pass

### CR-3 — Reticulum: verbatim RNode config + forum link  *(I3)*
A `<pre>` RNode interface block with the exact values + a Chaos Mesh forum link (new tab).
```sh
grep -F 'RNodeInterface' public/config/index.html        # Expect: present
grep -F '869475000' public/config/index.html             # Expect: frequency
grep -F 'spreadingfactor = 7' public/config/index.html   # Expect: SF 7
grep -F 'codingrate = 5' public/config/index.html        # Expect: CR 5
grep -E 'forum\.chaosmesh\.net[^"]*"[^>]*target="_blank"' public/config/index.html  # Expect: forum link, new tab
```
- **Expect:** RNode block verbatim (freq 869475000, bw 125000, SF 7, CR 5, tx 22) + forum link new-tab.
- [ ] Pass

### CR-4 — Meshcore channel deep-links, kept blue  *(I6)*
Each of the six channel names is a `meshcore://channel/add?name=…&secret=…` deep link, styled **cyan** (`.chan-link`), not amber, with no `target=_blank`/↗ (custom scheme, app deep link).
```sh
grep -c 'meshcore://channel/add' public/config/index.html   # Expect: 6
for p in '%23dwebcamp&secret=b8769b859a18cb47fa326c79bc04e2da' '%23schedule&secret=03a5bab42c9d3535b69f259f338be9ea' '%23workshop&secret=3862ef52df5e5966eb10751b83788bc5' '%23bot&secret=eb50a1bcb3e4e5d7bf69a57c9dada211' '%23berlinmesh&secret=c5ead1d8a7647a63fd37d156cdc3e257' '%23berlinbrandenburg&secret=625ff2a308bbe3a4c90da77979b7a4fc'; do grep -qF "$p" public/config/index.html && echo "ok" || echo "MISS $p"; done  # Expect: 6× ok
grep -E '\.chan-link[^}]*--cyan' public/css/style.css        # Expect: cyan styling
grep -nE 'meshcore://[^"]*"[^>]*target="_blank"' public/config/index.html  # Expect: NO output (no new-tab on deep links)
```
- **Expect:** 6 `meshcore://channel/add` deep links with the exact name+secret pairs, cyan-styled, no new-tab/↗.
- [ ] Pass

### Regression — surviving prior criteria still pass  *(CR feature)*
**Still must pass:** §2/§3 (QR is **local**; only external **asset** remains the `/flash` iframe — `check-offline.sh` green), §4 (relative img path portable at `/dweb-mesh/`), §5 (footer), **SS-5** (existing preset/channels/apps checks unchanged — the table now deep-links the names but keeps the six secrets + scope text), **SS-8** (new **web** links open new-tab; `meshcore://` deep links exempt as non-http), **S2** (+~84 KB QR stays low-MB), **WS-1–WS-7**.
- [ ] Pass (no regression)

---

## Enhancement: copy-to-clipboard on code blocks  *(copy-code.js)*

### CC-1 — Copy button on code blocks (local, offline-safe)
`copy-code.js` (loaded site-wide via the base template) adds a copy button to every `<pre>` that contains a `<code>` (skips the dynamic provision-log `<pre>`, which has no `<code>`); copies via the Clipboard API with an `execCommand` fallback so it works on the insecure-context offline copy too. Local JS only.
```sh
test -f public/js/copy-code.js && echo ok            # Expect: ok (local script)
grep -c 'copy-code.js' public/index.html             # Expect: >=1 (global, via base template)
grep -Ec 'https?://' public/js/copy-code.js          # Expect: 0 (no external refs)
grep -c 'execCommand' public/js/copy-code.js         # Expect: >=1 (offline fallback)
```
- **Expect:** local copy script, `check-offline.sh` green; a button appears on the Reticulum `<pre><code>` but NOT on the provision-log `<pre>`. **MANUAL (browser):** clicking copies the block and flashes "copied".
- [ ] Pass

---

## Feature: Live landing data from the dashboard  *(J1–J4)*

### LD-1 — Remote-first fetch, bounded, with local fallback  *(J1)*
`counters.js` fetches live stats (`/api/stats`) + recent messages (`/api/messages?limit=3`) with a bounded `AbortController` timeout, falling back to the local JSON.
```sh
grep -Fc 'dweb.potatomesh.net/api/stats' public/js/counters.js   # Expect: >=1 (live stats endpoint)
grep -Fc 'api/messages?limit=3' public/js/counters.js            # Expect: >=1 (live messages, limit param)
grep -c 'AbortController' public/js/counters.js                  # Expect: >=1 (bounded timeout)
grep -Fc 'stats.json' public/js/counters.js                      # Expect: >=1 (local fallback)
grep -Fc 'messages.json' public/js/counters.js                   # Expect: >=1 (local fallback)
```
- **Expect:** remote-first to the dashboard, bounded ~2.5 s timeout, local-JSON fallback. Live only when the API returns `Access-Control-Allow-Origin` (J3); otherwise local.
- [ ] Pass

### LD-2 — Offline render unaffected  *(J2 — the guarantee the gate cannot see)*
With no network / CORS-blocked, the splash still renders: counters fall back to local JSON then placeholders; the messages box to local then hidden. The local files ship as the fallback source.
```sh
scripts/check-offline.sh                                          # Expect: OK (the fetch URL is data, not an asset; gate stays green)
test -f public/stats.json && test -f public/messages.json && echo ok   # Expect: ok (local fallbacks shipped)
grep -c 'catch' public/js/counters.js                            # Expect: >=1 (every remote failure caught → fallback, never an unhandled throw)
```
- **Expect:** local fallback files present; remote failures caught and fall back; `check-offline.sh` green. **MANUAL:** load with the network blocked → counters show local values and the page renders fully.
- [ ] Pass

### LD-3 — Blinking cursor on the splash, reduced-motion aware  *(J4)*
A blinking underscore after the splash title via CSS only; steady (no blink) under `prefers-reduced-motion`.
```sh
grep -Fc 'splash-title::after' public/css/style.css              # Expect: >=1 (the cursor)
grep -Fc 'prefers-reduced-motion' public/css/style.css           # Expect: >=1 (steady when reduced)
find public -name '*.js' | wc -l                                 # Expect: 5 (this LD change added no JS; the +1 is workshop.js, added later by P1)
```
- **Expect:** a CSS-only blinking underscore after “JOIN THE MESH”; honours reduced-motion; the LD change adds no new JS file (the count reads 5 only because P1 later adds `workshop.js`).
- [ ] Pass

### Regression — surviving prior criteria still pass  *(LD feature)*
**Still must pass:** §2/§3 (assets stay local; `check-offline.sh` green — the data `fetch()` is not an asset; **the offline render is held by the bounded timeout + local fallback, not the gate**), §4 (fallback paths relative), §8 (counters/messages still populate — now remote→local→placeholder), CR-2 (`messages.json` remains the box's offline fallback), S3/WS-2 (JS inventory unchanged — `counters.js` edited, no new file).
- [ ] Pass (no regression)

---

## Feature: Message timestamps in Berlin time (CET/CEST)  *(SPEC.md → Feature: Message timestamps in Berlin time, K1–K3)*

Added 2026-06-23. A zero-context reviewer judges the timestamp change with **TZ-1…TZ-3**,
in addition to the surviving criteria (regression line at end). The change is confined to
`fmtTs()` in `static/js/counters.js`; the splash messages box (J1 / §8) is otherwise unchanged.
Build first (`zola build`), then serve `public/` at root per §0.

### TZ-1 — Renders in Europe/Berlin via built-in `Intl`, no tz library  *(K1/K2; D3)*
```sh
grep -Fc 'Europe/Berlin'       public/js/counters.js   # Expect: >=1 (fixed Berlin zone — not viewer-local, not UTC)
grep -Fc 'Intl.DateTimeFormat' public/js/counters.js   # Expect: >=1 (built-in Intl conversion)
grep -Eic 'moment|luxon|dayjs|date-fns|spacetime|js-joda|timezone-js|moment-timezone|tz\.min' public/js/counters.js   # Expect: 0 (no tz library; the built-in Intl 'timeZone' option is NOT a library)
scripts/check-offline.sh                                # Expect: OK (no external asset; Intl is built-in)
```
- **Expect:** `fmtTs()` converts to `Europe/Berlin` using the engine's built-in `Intl` tz database; no timezone library is added; `check-offline.sh` stays green. The only `https://` in the file remains the J1 dashboard API URLs (runtime **data**, not an asset).
- [ ] Pass

### TZ-2 — `CET`/`CEST` label, offset-derived (not UTC, not `GMT+offset`)  *(K3)*
```sh
grep -c 'CEST'  public/js/counters.js          # Expect: >=1 (summer label)
grep -Ec '\bCET\b' public/js/counters.js       # Expect: >=1 (winter label)
grep -Fc '" UTC"' public/js/counters.js        # Expect: 0 (the old ` UTC` suffix is gone)
grep -Ec 'timeZoneName *:' public/js/counters.js # Expect: 0 (the timeZoneName Intl *option* is unused — label is offset-derived; a comment naming it is fine)
```
- **Expect:** the visible suffix is ` CET` / ` CEST`, chosen from the computed Berlin UTC offset for that instant (+120 min → `CEST`, +60 → `CET`); the literal ` UTC` suffix is removed; the label is not the engine's `GMT+2`-style `timeZoneName`. *(CET is the winter branch — not exercised by the summer-only sample data; TZ-3 verifies the summer value.)*
- [ ] Pass

### TZ-3 — The rendered time is Berlin-local and DST-correct  *(K1/K3 — behavioral, against committed data)*
- **Verify:** with the network blocked (so the box uses the committed local `messages.json`, per §0 / LD-2), load `/` and read the **newest** message's timestamp in the recent-messages box.
- **Expect:** it reads **`2026-06-21 17:07 CEST`** — the record's `2026-06-21T15:07:59Z` UTC instant shifted **+2 h** into Central European Summer Time, seconds dropped, labelled `CEST`. (Not `15:07 UTC`; not the viewer's own timezone.)
- [ ] Pass

### Regression — surviving prior criteria still pass  *(TZ feature)*
**Still must pass:** §1 (clean build); **§2/§3 + `check-offline.sh`** (no new asset; **no tz library** — *at risk* if a library were added); §8 / LD-1 / LD-2 (the box still fetches remote→local→hidden and renders offline); **LD-3** (`find public -name '*.js' | wc -l` is now **5** — P1 added `workshop.js`; the TZ edit itself adds no file); **S3 / WS-2** (JS inventory = the five local files, incl. P1's `workshop.js`); CR-2 (`messages.json` remains the offline fallback). The change is presentation-only inside `fmtTs()`.
- [ ] Pass (no regression)

---

## Feature: Workshop session details (sourced schedule + talx links)  *(SPEC.md → Feature: Workshop session details, L1–L4)*

Added 2026-06-24. A zero-context reviewer judges `/workshop/` with **WK-1…WK-4**, in addition
to the surviving criteria (regression line at end). This feature **amends SS-6** (its pre-L1
`grep TBC` / "no links" assertions are retired — see the note at SS-6). Build first (`zola
build`), then check `public/workshop/index.html`. The four sessions and their talx IDs:
(1) **YLKXWX** Join the DWeb Camp Mesh + Tech Support — Wed Jul 8, 13:00–18:00 @ Mesh Nest (5);
(2) **ZHGJNM** Join the DWeb Camp Mesh! — Thu Jul 9, 09:30–09:40 @ Hacker's Lab (7);
(3) **L9WV3W** Introduction to Meshtastic and Meshcore — Thu Jul 9, 15:00–16:00 @ Hacker's Lab (7);
(4) **LBV3GJ** Off the grid: Reticulum app over LoRa — Fri Jul 10, 10:30–12:00 @ Hacker's Lab (7).

### WK-1 — Four sessions, time-ordered, with metadata + summary + link  *(L1)*
```sh
for id in YLKXWX ZHGJNM L9WV3W LBV3GJ; do grep -qF "talk/$id/" public/workshop/index.html && echo "ok $id" || echo "MISSING $id"; done   # Expect: 4× ok (one talx link per session)
grep -noE 'YLKXWX|ZHGJNM|L9WV3W|LBV3GJ' public/workshop/index.html   # Expect: top-to-bottom = YLKXWX, ZHGJNM, L9WV3W, LBV3GJ (schedule order Wed Jul 8 → Fri Jul 10, NOT supplied-link order)
grep -Eo 'Jul (8|9|10)' public/workshop/index.html | sort -u          # Expect: Jul 8, Jul 9, Jul 10 (all three camp days)
grep -c 'Mesh Nest'   public/workshop/index.html                      # Expect: >=1 (session 1 room)
grep -c "Hacker's Lab" public/workshop/index.html                     # Expect: >=3 (sessions 2-4 room; team-supplied no. (7), not on talx)
grep -c 'Afri'        public/workshop/index.html                      # Expect: >=4 (speaker on every session)
grep -o 'class="sess-hi"' public/workshop/index.html | wc -l          # Expect: 8 (date-time + location = 2 spans × 4 sessions, muted blue)
grep -F 'sess-hi' public/css/style.css                                # Expect: present (.sess-hi maps to --cyan-dim, the muted blue)
grep -nE '—|–|&mdash;|&ndash;' public/workshop/index.html             # Expect: NO output (plain hyphens only - hacker register)
```
- **Expect:** the four sessions render **in schedule order**, each = title + a metadata line `Type · Day Mon D · HH:MM–HH:MM · Room · Speaker` + a one-line summary + a `Details ↗` talx link. The **date-time and location are styled muted blue** (`.sess-hi`); venue numbers (Mesh Nest (5), Hacker's Lab (7)) are team-supplied (D12), not from talx. Prose uses plain hyphens, no em/en-dashes. *(Manual: the summary is a single line; the full talx abstract is NOT duplicated inline - it lives behind the link.)*
- [ ] Pass

### WK-2 — Sourced from talx, nothing invented  *(L2; D5/D12)*
```sh
for t in '13:00' '09:30' '15:00' '10:30'; do grep -qF "$t" public/workshop/index.html && echo "ok $t" || echo "MISSING $t"; done   # Expect: 4× ok (the four start times, from talx)
grep -ic 'drop-in'   public/workshop/index.html   # Expect: >=1 (session 1 has NO type on talx → descriptive "drop-in", not an invented formal label)
grep -ic 'lightning' public/workshop/index.html   # Expect: >=1 (session 2 type, from talx)
```
- **Expect:** every rendered time / room / type / speaker / summary appears on the linked talx page (**manual** cross-check against the four URLs); session 1's missing type is shown descriptively ("Mesh Nest · drop-in"), flagged for team confirm, not fabricated; no value is invented.
- [ ] Pass

### WK-3 — External links: new tab, hyperlinks not assets  *(L3; D3/§2, G6/SS-8)*
```sh
grep -Eo 'href="https://talx\.dod\.ngo/[^"]*"[^>]*target="_blank"[^>]*rel="noopener"' public/workshop/index.html | wc -l   # Expect: 4 (all open a new tab, rel=noopener)
grep -rEoh '<a\b[^>]*href="https?://[^"]*"[^>]*>' public/workshop/index.html | grep -v 'target="_blank"'   # Expect: NO output (no external <a> on the page misses target=_blank — SS-8 holds)
grep -nE '<(link|script|img|source|video|audio|iframe|embed)\b[^>]*\bsrc="https?://talx' public/workshop/index.html   # Expect: NO output (talx is <a> hyperlinks only, never an asset)
scripts/check-offline.sh   # Expect: OK (no external asset added)
```
- **Expect:** four talx `<a>` links, each `target="_blank" rel="noopener"` with the `↗` (`&#8599;`) glyph; no external asset; `check-offline.sh` green; the offline copy still renders (links just don't resolve offline). `talx.dod.ngo` is the only **new** host in the §2(d) external-link inventory.
- [ ] Pass

### WK-4 — Extensible, honestly non-final  *(L4; D12)*
```sh
grep -i 'more sessions may be added' public/workshop/index.html   # Expect: present (page reads as non-exhaustive)
grep -F '.tbc' public/css/style.css                              # Expect: present (the TBC marker survives for any FUTURE unscheduled session)
```
- **Expect:** a standing "more sessions may be added" line; the `.tbc` styling remains for future *unscheduled* sessions. The current four are scheduled, so `grep -ic TBC public/workshop/index.html` may be **0** — that is correct, not a failure (WK-2 guarantees no invention; WK-4 keeps the page honestly non-final).
- [ ] Pass

### Regression — surviving prior criteria still pass  *(WK feature)*
**Amended (planned, not a regression):** **SS-6** — its pre-L1 `grep TBC` ≥1 and "no links inside the workshop content" assertions are retired and replaced by **WK-1…WK-4** (links are now expected). **Still must pass:** §1 (clean build), **§2/§3 + `check-offline.sh`** (talx links are hyperlinks, not assets — offline render intact), §2(d) inventory (adds exactly `talx.dod.ngo`), §4 (internal links unchanged; subpath build still works), §5 / LP-6 (footer chrome untouched), **SS-1** (the 7-route IA still includes `/workshop/`), **SS-8** (every external `<a>`, the four new ones included, opens a new tab). All other groups (LP, WS, CR, CC, LD, TZ, S*) untouched.
- [ ] Pass (no regression in the surviving criteria)

## Feature: Intel page (embedded mesh-intel dashboard)  *(SPEC.md → Feature: Intel page, N1–N4)*

Added 2026-06-24. A zero-context reviewer judges the Intel page with **IN-1…IN-5**, in addition to
the surviving criteria (regression line at end). This feature **amends §2/§3** (a *second* scoped
external-asset carve-out — see the §2/§3 notes), **SS-1** (7→8 routes) and **SS-9** (one→two scoped
hosts). The new route is `/intel/`; nav label **INTEL** between **CONFIG** and **WORKSHOP**; the page
is chrome-only (header + footer + one full-bleed iframe). Build first: `zola build`.

### IN-1 — Route exists, nav placement, host-less link  *(N1)*
```sh
test -f public/intel/index.html && echo "OK /intel/" || echo "MISSING /intel/"   # Expect: OK /intel/
grep -oE '>(CONFIG|INTEL|WORKSHOP)<' public/index.html | tr -d '<>' | tr '\n' ' '  # Expect: CONFIG INTEL WORKSHOP (that order)
grep -Eo 'href="/intel/"' public/index.html | head -1   # Expect: present (host-less internal nav link, D2)
```
- **Expect:** `/intel/` builds; the nav carries **INTEL between CONFIG and WORKSHOP** on every page; the internal link is host-less `/intel/` (no domain). *(Manual: clicking INTEL routes to the page.)*
- [ ] Pass

### IN-2 — Chrome-only, full-bleed meshint iframe with verbatim `?d=`  *(N1/N2/N4)*
```sh
grep -Eo '<iframe[^>]*src="https://meshint\.potatomesh\.net/\?d=dweb\.potatomesh\.net"' public/intel/index.html   # Expect: present (exact src, ?d= preserved)
grep -c '<iframe' public/intel/index.html       # Expect: 1 (exactly one iframe)
grep -c '<h1'         public/intel/index.html    # Expect: 0 (chrome-only: no heading / body copy)
grep -c 'class="doc"' public/intel/index.html    # Expect: 0 (bypasses the standard 72ch article wrapper)
grep -Eio 'title="mesh intel"' public/intel/index.html   # Expect: present (iframe title, N4)
grep -c 'loading="lazy"' public/intel/index.html         # Expect: >=1 (N4)
```
- **Expect:** exactly one `<iframe>` whose `src` is **verbatim** `https://meshint.potatomesh.net/?d=dweb.potatomesh.net` (the `?d=` query is load-bearing); no `<h1>`/`.doc` wrapper (chrome-only); `title` + `loading="lazy"` set. *(Manual/build, N4: the frame actually renders online — `meshint.potatomesh.net` returns no `X-Frame-Options: DENY` / restrictive `frame-ancestors`.)*
- [ ] Pass

### IN-3 — The `/intel` carve-out is SCOPED to host AND page  *(N2; the SS-9 analog)*
```sh
scripts/check-offline.sh                       # Expect: OK (passes WITH the meshint iframe on /intel)
# (a) other external assets on /intel still caught:
printf '<img src="https://evil.example/y.png">' >> public/intel/index.html
scripts/check-offline.sh ; echo "exit=$?"      # Expect: FAIL (non-zero)
zola build                                     # rebuild → planted asset gone
# (b) meshint is allowed ONLY on /intel — the same iframe on another page must FAIL:
printf '<iframe src="https://meshint.potatomesh.net/?d=x"></iframe>' >> public/contact/index.html
scripts/check-offline.sh ; echo "exit=$?"      # Expect: FAIL (meshint not allowed off /intel)
zola build                                     # rebuild → discard
```
- **Expect:** the gate passes with the legit meshint iframe on `/intel`, still **FAILS** on any other external asset on `/intel`, and **FAILS** if the meshint iframe appears on any non-`/intel` page. The carve-out is scoped to **host + page**, not a global host allow.
- [ ] Pass

### IN-4 — Footer present; bare iframe (no fallback link)  *(N3; §5/LP-6 hold)*
```sh
grep -ic 'tent 5' public/intel/index.html               # Expect: >=1 (footer on /intel — §5 holds)
grep -Eoq 'href="https://matrix\.to/#/#dweb-mesh:dod\.ngo"' public/intel/index.html && echo "matrix OK"  # Expect: matrix OK
grep -rEoh '<a\b[^>]*href="https?://[^"]*"' public/intel/index.html | sort -u   # Expect: ONLY the footer's matrix.to + dashboard links (no intel-specific fallback link)
```
- **Expect:** the base-template footer (tent 5 + Matrix link + dashboard) renders on `/intel`, so §5/LP-6 hold; **no extra fallback hyperlink** is added (bare-iframe design, N3). *(Manual: with the network blocked, `/intel` still renders header + footer; the iframe area is blank — accepted, as the flasher.)*
- [ ] Pass

### IN-5 — Full-bleed layout  *(N1 — MANUAL: browser; static CSS check)*
```sh
grep -Eic 'intel' static/css/style.css   # Expect: >=1 (full-bleed iframe layout styles for the intel page)
```
- **Expect (MANUAL, browser):** the iframe fills 100% width and the full height **between** header and footer; the page itself does not scroll (the frame scrolls internally); the footer is visible below the frame. Static: the intel layout CSS exists.
- [ ] Pass

### Regression — surviving prior criteria still pass  *(IN feature)*
**Amended (planned, not a regression):** **§2/§3** (now **two** scoped iframe assets; `check-offline.sh` still green and still fails on a third), **SS-1** (7→8 routes), **SS-9** (one→two scoped hosts; its `/flash` proof unchanged). **Still must pass:** §1 (clean build), §4 (subpath build still works; `/intel` internal link host-less), **§5 / LP-6** (footer on `/intel`), **SS-8** (no external `<a>` without `target="_blank"` — the meshint iframe is an **asset**, not an `<a>`; footer links unchanged), and every other group (LP, WS, CR, CC, LD, TZ, WK, S1–S6) untouched. **At risk:** §2 (the gate must still catch a *third* asset → IN-3), §5 (the new `intel.html` template must still inherit the base footer → IN-4).
- [ ] Pass (no regression in the surviving criteria)

---

## Feature: Splash event caption  *(SPEC.md → Feature: Splash event caption, O1)*

Added 2026-06-25. A zero-context reviewer judges the caption with **EC-1**, in addition to the
surviving criteria (regression line below). The caption is **plain muted text** under the splash
title; it adds no asset and no link. Build first (`zola build`), then check `public/index.html`.

### EC-1 — Muted event caption under the title; line 2 a muted link  *(O1, amended 2026-06-26)*
```sh
grep -F 'class="splash-meta"' public/index.html               # Expect: present (the caption element)
grep -F 'July 8-12, Alte Hölle, Wiesenburg' public/index.html # Expect: present (line 1: dates + venue)
grep -Fc 'dwebcamp.org' public/index.html                     # Expect: >=1 (line 2)
grep -Eo '<a[^>]*href="https://dwebcamp\.org/?"[^>]*>dwebcamp\.org</a>' public/index.html   # Expect: present (line 2 links to dwebcamp.org)
grep -Eo 'href="https://dwebcamp\.org/?"[^>]*target="_blank"[^>]*rel="noopener"' public/index.html   # Expect: present (new tab - G6/SS-8)
grep -F 'splash-meta a' public/css/style.css                  # Expect: present (link styled muted, not amber)
grep -F 'splash-meta' public/index.html | grep -E '—|–|&mdash;|&ndash;'   # Expect: NO output (plain hyphen in "8-12")
# LP-4 still holds (the caption did NOT reintroduce the removed sub-line / its class / SYNC):
grep -c  'splash-sub' public/index.html                       # Expect: 0
grep -ic 'SYNC'       public/index.html                       # Expect: 0
grep -ic 'JOIN'       public/index.html                       # Expect: >=1 (title kept)
scripts/check-offline.sh                                      # Expect: OK (caption is text, no asset)
```
- **Expect:** a `.splash-meta` caption directly beneath the `JOIN THE MESH` title and above the HUD: line 1 `July 8-12, Alte Hölle, Wiesenburg` (plain muted text), line 2 `dwebcamp.org` as a **muted link** → `https://dwebcamp.org`, `target="_blank" rel="noopener"` (G6/SS-8), styled muted via `.splash-meta a` (overrides the amber link colour). No `splash-sub`, no `SYNC` (LP-4 intact); the link is a **hyperlink, not an asset** (`check-offline.sh` green); the §2(d) inventory gains `dwebcamp.org` (root) alongside the existing BUY DEVICE `dwebcamp.org/tickets` (same host). *(Manual: the caption sits between the title and the NODES/MESSAGES HUD.)*
- [ ] Pass

### Regression — surviving prior criteria still pass  *(EC feature)*
**Still must pass:** **LP-4** (caption uses `.splash-meta`, not `splash-sub`; no `SYNC`; JOIN + both counters kept — EC-1 re-checks), §2/§3 + `check-offline.sh` (the dwebcamp.org link is a **hyperlink, not an asset**), **SS-8** (the new external `<a>` opens a new tab — EC-1 checks `target=_blank rel=noopener`), **LP-5 / §2(d)** (the external-link inventory now lists `dwebcamp.org/tickets` **and** `dwebcamp.org` root — same host, intentional), §5/LP-6 (footer untouched), and every other group. The splash title cursor (LD-3/J4) and counters (§8) are unaffected.
- [ ] Pass (no regression)

---

## Feature: Workshop live time-state (CEST)  *(SPEC.md → Feature: Workshop live time-state, P1–P4)*

Added 2026-06-25. A zero-context reviewer judges `/workshop/`'s clock-aware rendering with
**WT-1…WT-4**, in addition to the surviving criteria (regression line below). This feature
**amends the JS-count assertions** in **S3, WS-2, CR-1, LD-3** (and the TZ-3 regression line):
the inventory grows 4→5 with the new **local** `workshop.js`. Static checks are auto-verifiable;
the time-dependent behaviour is **MANUAL** (it depends on the device clock). Build first (`zola
build`), then check `public/workshop/`.

### WT-1 — New page-scoped local JS; count amended 4→5  *(P1; D1/D3)*
```sh
test -f public/js/workshop.js && echo "present"              # Expect: present (the 5th JS file)
grep -Ec 'https?://' public/js/workshop.js                   # Expect: 0 (no external refs — Date only, local)
grep -Ec 'fetch\(|XMLHttpRequest|import[^;]*https?://' public/js/workshop.js   # Expect: 0 (no network)
grep -c 'workshop.js' public/workshop/index.html             # Expect: >=1 (loaded on /workshop/)
grep -rl 'workshop.js' public/ --include='*.html'            # Expect: ONLY public/workshop/index.html (page-scoped, not site-wide)
find public -name '*.js' | sort                              # Expect: copy-code.js, counters.js, mesh-provision.js, vendor/meshcore.min.js, workshop.js (5)
scripts/check-offline.sh                                     # Expect: OK
```
- **Expect:** `workshop.js` is local, network-free, loaded **only** on `/workshop/` (a dedicated `templates/workshop.html` fills `{% block scripts %}`, exactly as `index.html` loads `counters.js`). The JS inventory is now **5** local files; the repo stays node-free. This is the **amendment** to S3 / WS-2 / CR-1 / LD-3.
- [ ] Pass

### WT-2 — Each session carries CEST start/end; past sessions dim  *(P2/P4)*
```sh
grep -c 'data-start=' public/workshop/index.html             # Expect: 4 (one per session)
grep -c 'data-end='   public/workshop/index.html             # Expect: 4
grep -o '+02:00' public/workshop/index.html | wc -l          # Expect: 8 (CEST offset on every start + end — 4 sessions × 2 attrs — P4)
for t in 2026-07-08T13:00 2026-07-09T09:30 2026-07-09T15:00 2026-07-10T10:30; do grep -qF "$t" public/workshop/index.html && echo "ok $t" || echo "MISSING $t"; done   # Expect: 4× ok (starts, matching the visible talx times)
for t in 2026-07-08T18:00 2026-07-09T09:40 2026-07-09T16:00 2026-07-10T12:00; do grep -qF "$t" public/workshop/index.html && echo "ok $t" || echo "MISSING $t"; done   # Expect: 4× ok (ends)
grep -F 'session--past' public/js/workshop.js                # Expect: present (class applied when now > end)
grep -F 'session--past' public/css/style.css                 # Expect: present (muted-grey styling)
```
- **Expect:** all four sessions are wrapped with `data-start`/`data-end` absolute instants at **`+02:00`** (CEST), matching the visible talx times; `workshop.js` applies `.session--past` (muted grey) once the device clock is past a session's **end**. *(MANUAL, clock-dependent: with the clock set after a session's end, that whole session block — heading, metadata, summary, Details link — renders muted grey; before its end it renders normally. With JS disabled, no session dims.)*
- [ ] Pass

### WT-3 — Live session shows a blinking orange square; sess-hi invariant held  *(P3; J4)*
```sh
grep -F 'session--live' public/js/workshop.js                # Expect: present (live class added when start<=now<=end)
grep -F 'live-dot' public/css/style.css                      # Expect: present (orange square + blink)
grep -Fc 'prefers-reduced-motion' public/css/style.css       # Expect: >=2 (J4 cursor + live-dot steady-when-reduced)
grep -o 'class="sess-hi"' public/workshop/index.html | wc -l # Expect: 8 (WK-1 invariant — the live marker is .live-dot, NOT a sess-hi span)
```
- **Expect:** a `.live-dot` element (orange `--amber` square `■`) sits before the live session's time and **blinks**, reusing J4's keyframe; under `prefers-reduced-motion` it is steady (no blink). It is a separate element, so `class="sess-hi"` still appears exactly **8** times (WK-1 holds). *(MANUAL, clock-dependent: with the clock inside a session's window, exactly that session shows the blinking square; outside any window, none do.)*
- [ ] Pass

### WT-4 — No tz library; device-clock compare; 60 s refresh; offline-safe  *(P4; D3/K-style)*
```sh
grep -Eic 'moment|luxon|dayjs|date-fns|spacetime|js-joda|timezone-js|moment-timezone|tz\.min' public/js/workshop.js   # Expect: 0 (no tz library — Date parsing only; a 'timezone' mention in a comment is not a library, matching TZ-1)
grep -Ec 'new Date|Date\.now|getTime' public/js/workshop.js  # Expect: >=1 (compares against the device clock)
grep -E 'setInterval|60000|60 ?\* ?1000' public/js/workshop.js  # Expect: present (recompute every 60 s)
scripts/check-offline.sh                                     # Expect: OK
```
- **Expect:** start/end instants are compared to `Date.now()` (absolute epoch) so the result is the same regardless of the viewer's own timezone; **no timezone library** is added (the `+02:00` offset in the data is enough — `Date` parses it); states recompute on load and every **60 s**; `check-offline.sh` green. *(MANUAL: with the network blocked / JS disabled, the page still renders all four sessions normally — the offline Freifunk copy is unaffected.)*
- [ ] Pass

### Regression — surviving prior criteria still pass  *(WT feature)*
**Amended (planned, not a regression):** **S3, WS-2, CR-1, LD-3** and the **TZ-3** regression line — the JS inventory grows 4→5 with the **local** `workshop.js` (repo still node-free; `check-offline.sh` green). **Still must pass:** §1 (clean build), **§2/§3 + `check-offline.sh`** (workshop.js is local, network-free — no asset, no external import), §4 (internal links + subpath build unchanged), §5/LP-6 (footer untouched), **WK-1** (`class="sess-hi"`==8, the four talx IDs in schedule order, Mesh Nest / Hacker's Lab / Afri strings, plain hyphens — all preserved through the per-session wrap; WT-2/WT-3 re-assert the at-risk ones), **WK-2/WK-3** (visible times + the four `target=_blank` talx links intact), §8/LD/TZ (the splash counters/messages JS is untouched), and every other group (S, LP, SS, CC, CR, IN).
- [ ] Pass (no regression in the surviving criteria)

---

## Verdict

A build is **ACCEPTED** only when the surviving boxes (§1–§5, §8, §10; S1–S3, S6), LP-1–LP-7, SS-1–SS-9, **WS-1–WS-7**, **CR-1–CR-4**, **CC-1**, **LD-1–LD-3**, **TZ-1–TZ-3**, **WK-1–WK-4**, **IN-1–IN-5**, **EC-1**, and **WT-1–WT-4** are all ticked, and amended §2/§3 hold. (§6/§7/§9 + S4/S5 superseded by SS; **SS-6 amended by WK-1…WK-4**; **§2/§3/SS-1/SS-9 amended by N1/N2/N3 — Intel page**; S3/LP-1 amended by H2; **S3/WS-2/CR-1/LD-3 JS-count 4→5 amended by P1 — Workshop live time-state**; **WS-6 is MANUAL**, hardware-verified by the team.)
Record the date, the Zola version, and any waived item with its justification.
