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

```sh
# (a) No external assets in HTML (script/link/img/source/video/audio/iframe/embed):
grep -rEoin '<(link|script|img|source|video|audio|iframe|embed)\b[^>]*\b(src|href)=["'"'"']https?://' public/
#   Expect: NO output.

# (b) No external CSS imports / url():
grep -rEin '(@import|url\()\s*["'"'"']?https?://' public/
#   Expect: NO output.

# (c) No analytics / tracking / CDN hosts anywhere:
grep -rEin 'google-analytics|googletagmanager|gtag|plausible|matomo|fonts\.(googleapis|gstatic)|cdn\.|jsdelivr|unpkg|cloudflare' public/
#   Expect: NO output.

# (d) Inventory of external hyperlinks for human review (must be intentional):
grep -rEohin '<a\b[^>]*href=["'"'"']https?://[^"'"'"']*' public/ | sort -u
#   Expect: ONLY matrix.to (footer), device vendor buy links, and dated source
#           citations. No surprises.
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
grep -rEoin 'href=["'"'"']https?://dweb\.dod\.ngo' public/    # Expect: NO output (links are "/…", not absolute-with-host)

# Subpath capability (the D2 switch) actually works:
zola build --base-url /dweb-mesh/ -o public_sub
grep -rEoq 'href="/dweb-mesh/' public_sub && echo "subpath OK"   # Expect: subpath OK
rm -rf public_sub
```
- **Also:** on the root server, click through the full nav from `/` — every link 200s.
- [ ] Pass

## 5. Footer on every page  *(brief §13.5; D7)*

```sh
# Every HTML page mentions the tent-5 location:
grep -rL "tent 5" public/ --include='*.html'      # Expect: NO output (every file matches)

# The Matrix fallback link is present and correct:
grep -rEoq 'href="https://matrix\.to/#/#dweb-mesh:dod\.ngo"' public/ && echo "matrix OK"   # Expect: matrix OK
```
- **Expect:** every page carries Mesh Nest / tent 5 + the working Matrix link with
  the "when LoRa fails, this is how you reach a human" framing.
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
| **S6** | CNAME + CI present (D10) | `cat CNAME ; ls .github/workflows/` | `CNAME` = `dweb.dod.ngo`; a workflow builds Zola → Pages; Freifunk noted manual |

---

## Verdict

A build is **ACCEPTED** only when boxes 1–10 and S1–S6 are all ticked.
Record the date, the Zola version, and any waived item with its justification.
