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

Scans target only browser-loaded files (`*.html *.css *.js *.svg *.xml`). Prose
docs (`*.md`/`*.txt` — bundled font licenses & `SOURCES.md`) may legitimately name
a host (an OFL license cites `scripts.sil.org`) and are exempt. The canonical gate
is `scripts/check-offline.sh`; the greps below are the same checks, by hand.

```sh
INC="--include=*.html --include=*.css --include=*.js --include=*.svg --include=*.xml"

# (a) No external assets (script/link/img/source/video/audio/iframe/embed):
grep -rEoin $INC '<(link|script|img|source|video|audio|iframe|embed)\b[^>]*\b(src|href)=["'"'"']https?://' public/
#   Expect: ONLY the flasher.meshcore.io iframe under public/flash/ (G4 carve-out); nothing else.

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
  *(Amended by G4: `/flash` embeds the online-only `flasher.meshcore.io` iframe — it
  won't load offline, which is accepted; the rest of `/flash` and every other page
  still render fully offline with no other external request.)*
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
| **S3** | No node toolchain in repo (D1) *[amended by H2]* | `! test -e package.json ; ! test -d node_modules ; find public -name '*.js'` | NO `package.json`/`node_modules` in the repo; JS = hand-written + the **vendored** lib: `counters.js`, `mesh-provision.js`, `vendor/meshcore.min.js` — all local (governs the JS inventory; see **WS-1/WS-2**) |
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
# The nav adds NO script of its own; scripts now live only on the splash (counter)
# and /config (provisioning). Site-wide JS inventory is governed by S3 + WS-2.
grep -rEl '<script' public/ --include='*.html' | sort  # Expect: ONLY public/index.html and public/config/index.html
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

### SS-1 — Flat 7-page IA; old hierarchy gone  *(G1)*
```sh
for p in "" start hardware flash config workshop contact ; do
  test -f "public/${p:+$p/}index.html" && echo "OK  /$p/" || echo "MISSING /$p/"
done            # Expect: 7 lines, all OK
for d in settings devices meshcore meshtastic reticulum mesh-nest agenda about ; do
  test -e "public/$d" && echo "STALE /$d/" || echo "gone /$d/"
done            # Expect: 8 lines, all "gone"
```
- **Expect:** the 7 routes exist; the 8 pre-restructure paths are deleted; build is clean (§1); nav + footer link only to the 7 (no broken `get_url`).
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

### SS-6 — /workshop  *(G1)*
```sh
grep -riE 'TBC|to be confirmed|content.*later' public/workshop/index.html   # Expect: >=1 (content TBC)
```
- **Expect:** the 3 session titles + metadata only; body content marked TBC. *(Manual: no links inside the workshop content — footer/nav chrome links don't count.)*
- [ ] Pass

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
- **Expect:** `check-offline.sh` passes with the legitimate flasher iframe but still FAILS on any other external asset (even on `/flash`). The allowlist is one host, not a global off-switch.
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

### WS-2 — No node toolchain entered the repo  *(H2; D1)*
```sh
! test -e package.json && ! test -e package-lock.json && ! test -d node_modules && echo "repo node-free"   # Expect: repo node-free
find public -name '*.js' | sort   # Expect: exactly counters.js, mesh-provision.js, vendor/meshcore.min.js
```
- **Expect:** no `package.json`/`node_modules` in the repo; `zola build` alone produced the site; the JS inventory is exactly those three local files.
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
ls static/js/*.js   # Expect: only counters.js + mesh-provision.js (native <details>, no new JS)
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

## Verdict

A build is **ACCEPTED** only when the surviving boxes (§1–§5, §8, §10; S1–S3, S6), LP-1–LP-7, SS-1–SS-9, **WS-1–WS-7**, and **CR-1–CR-4** are all ticked, and amended §2/§3 hold. (§6/§7/§9 + S4/S5 superseded by SS; S3/LP-1 amended by H2; **WS-6 is MANUAL**, hardware-verified by the team.)
Record the date, the Zola version, and any waived item with its justification.
