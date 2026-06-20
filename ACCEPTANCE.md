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

Scans target only browser-loaded files (`*.html *.css *.js *.svg *.xml`). Prose
docs (`*.md`/`*.txt` — bundled font licenses & `SOURCES.md`) may legitimately name
a host (an OFL license cites `scripts.sil.org`) and are exempt. The canonical gate
is `scripts/check-offline.sh`; the greps below are the same checks, by hand.

```sh
INC="--include=*.html --include=*.css --include=*.js --include=*.svg --include=*.xml"

# (a) No external assets (script/link/img/source/video/audio/iframe/embed):
grep -rEoin $INC '<(link|script|img|source|video|audio|iframe|embed)\b[^>]*\b(src|href)=["'"'"']https?://' public/
#   Expect: NO output.

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

## 6. All site-map routes exist and route correctly  *(brief §13.6; SPEC §2)*

```sh
for p in "" start settings devices \
         meshcore meshcore/flash meshcore/config meshcore/services \
         meshtastic meshtastic/flash meshtastic/config \
         reticulum reticulum/start reticulum/workshop \
         mesh-nest agenda about ; do
  test -f "public/$p/index.html" -o -f "public/index.html" && \
    test -f "public/${p:+$p/}index.html" && echo "OK  /$p/" || echo "MISSING /$p/"
done
# Expect: 17 lines, all "OK".
```
- [ ] Pass (17/17)

## 7. Meshtastic "no services" + stacks parallel, no bridges  *(brief §13.7; D8)*

```sh
# Meshtastic explicitly runs no services from our side:
grep -riE 'no services' public/meshtastic/                 # Expect: present on the hub/config
# No-bridge statement appears on each stack:
grep -riE 'no bridge|parallel|independent|do not (bridge|interop)' public/meshcore/ public/meshtastic/ public/reticulum/
#   Expect: each stack states it does not bridge to the others.
```
- [ ] Pass

## 8. Splash counters read `stats.json` + graceful fallback  *(brief §13.8; D6)*

- **Verify A (present):** with committed `stats.json` served at root, load `/` →
  node + message counters show the file's numbers.
- **Verify B (absent/unreachable):** rename it (`mv public/stats.json public/_stats.json`),
  reload `/` → a **static placeholder** shows. **No** infinite spinner, **no**
  console error spew, **no** hang. Restore the file afterward.
- **Expect:** both behaviors; the JS is local, tiny, framework-free.
- [ ] Pass

## 9. TBC fields are visible placeholders, not invented data  *(brief §13.9; D12)*

- **Verify:** `/settings/` shows **region, frequency slot, channel, preset, PSK**
  each rendered as a **visible TBC placeholder**. `/agenda/`, `/mesh-nest/` hours,
  and the meshcore AI-host depth are likewise marked TBC.
- **Expect:** no fabricated region/freq/PSK/agenda values anywhere.
```sh
grep -riE 'TBC|placeholder|supplied by the team' public/settings/   # Expect: present for all 5 fields
```
- [ ] Pass

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
| **S3** | No framework / no node_modules (D6) | `! test -d node_modules ; ls public/*.js` | only the tiny counter JS; no bundler output |
| **S4** | Stack hierarchy labelled (D8) | grep hubs | "PRIMARY"/"SUPPORTED"/"EDUCATIONAL" visible on meshcore/meshtastic/reticulum |
| **S5** | AI host inline, not a route (D9) | `! test -d public/meshcore/services/ai* ` ; grep services page | AI host appears as a line item under `/meshcore/services/`, no own page |
| **S6** | CNAME + CI present (D10) | `cat CNAME ; ls .github/workflows/` | `CNAME` = `mesh.dod.ngo`; a workflow builds Zola → Pages; Freifunk noted manual |

---

## Feature: Landing Page Structure  *(SPEC.md → Feature: Landing Page Structure, F1–F4)*

Added 2026-06-20. A zero-context reviewer judges the landing shell with **LP-1…LP-7**
below, **in addition to** §1–§10 and S1–S6 (regression line at the end). Build first
(`zola build`), then serve `public/` at root per §0.

### LP-1 — Collapsible nav is CSS-only  *(F1; protects S3, D3)*
```sh
ls public/*.js                                   # Expect: ONLY public/counters.js
grep -rEl '<script' public/ --include='*.html'   # Expect: ONLY public/index.html (the counter)
grep -Eic 'type=["'"'"']?checkbox' public/index.html   # Expect: >=1 (nav toggle is a checkbox, not JS)
```
- **Expect:** the nav collapse uses a hidden checkbox + CSS; no nav JavaScript; no second file in `public/*.js`.
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

## Verdict

A build is **ACCEPTED** only when boxes 1–10, S1–S6, and LP-1–LP-7 are all ticked.
Record the date, the Zola version, and any waived item with its justification.
