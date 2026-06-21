# SPEC — DWeb Camp 2026 Mesh Documentation Site

Status: **CONFIRMED 2026-06-16 — all 12 decisions accepted.** Domain: `mesh.dod.ngo` (root `/`).
Last updated: 2026-06-16.

---

## 0. The real goal (north star)

Get an attendee **from a boxed device to a working node on the camp's Meshcore
mesh**, fully offline, and tell them **where to reach a human when the radio goes
silent** (Mesh Nest, tent 5 / Matrix fallback).

The site is the **portable, self-contained memory of the mesh**. A network that
cannot be rebuilt from its documentation is a single point of failure, so the
load-bearing constraint that every other choice bends to is:

> **The site must render fully with zero upstream internet, and be portable by
> hand-copy.** Aesthetics, content depth, and tooling all serve that.

Success in one sentence: *a stranger on the Freifunk wifi with no internet opens
the site, flashes a device, joins Meshcore, and knows how to get help — and a
disinterested reviewer can confirm every acceptance criterion without asking us.*

---

## 1. Key Decisions — CONFIRM EACH (Phase 0 gate)

Reply `confirm all` to accept the set, or call out any by number to change.
I will re-verify this list at every later checkpoint to prevent drift.

| # | Decision | Choice |
|---|----------|--------|
| **D1** | **Generator** | **Zola** (mandated by brief §2). Single Rust binary, no `node_modules`. *Verified present: `zola 0.22.1`.* |
| **D2** | **Dual-root / URLs** | **Single source, single build, `base_url = "/"`** → **host-less root-absolute paths** (`/start/`, `/css/…`): links carry **no domain**, so the same artifact works at GH Pages *and* on the offline Freifunk host with **no DNS dependency**. **Custom domain `mesh.dod.ngo`** (committed `CNAME`) serves GH Pages at root; **the same build is the Freifunk manual drop**. One build, both targets. *(If ever subpath-scoped, `base_url` is the single switch + rebuild — all refs go through `get_url`. Link checker keeps refs honest.)* |
| **D3** | **Self-contained** *[amended by G4]* | **Zero external references — except** the single `flasher.meshcore.io` iframe on `/flash` (G4, scoped allowlist). No other CDN, webfont, external JS, analytics, remote anything. Grep gate in ACCEPTANCE enforces this; carve-out scoped to `/flash`. Every other byte ships in the repo. |
| **D4** | **Typography** | **Bundled OFL pixel font for display/chrome** (candidate: *Press Start 2P*) **+ bundled OFL monospace for body & the `/settings/` card** (candidate: a small legible OFL mono, final pick at build). Both self-hosted (`woff2`), subset where it helps payload. |
| **D5** | **Content depth** | **Hybrid.** Real, **dated + sourced** instructions for *stable* procedures (e.g. Meshtastic web-flasher flow, Reticulum `pip` install); **visible TBC placeholders** for *volatile / camp-private* items (Meshcore firmware specifics, exact presets, PSK). Light web research for the stable parts; team reviews before camp. |
| **D6** | **Live counters** | Vanilla JS (no framework, local, tiny) fetches **`./stats.json`** (site-root relative). **Commit a sample** `stats.json` = `{nodes:0, messages:0, updated:<ISO>}`. On any fetch failure → **static placeholder**, no spinner, no error spew. Mesh Nest box overwrites the file live. |
| **D7** | **Footer (every page)** *[amended by F4]* | Lives in the base template. **Mesh Nest, tent 5** + **Matrix `#dweb-mesh:dod.ngo` → `https://matrix.to/#/#dweb-mesh:dod.ngo`**. ~~Phrasing: *"when LoRa fails, this is how you reach a human."*~~ **Superseded by F4** — compact single-line four-item footer, phrasing dropped. Footer-on-every-page + tent 5 + Matrix link remain load-bearing. |
| **D8** | **Three stacks, no bridges** *[amended by G2]* | Parallel + independent. **Meshcore = PRIMARY** (the funnel). **Meshtastic = SUPPORTED** (Router on `MediumFast`, *no services*) and **Reticulum = EDUCATIONAL** (→ Workshop) now survive as a **note on `/start`**, ~~not dedicated stack pages~~. No-bridge / no-services preserved, relocated. |
| **D9** | **AI host** *[amended by G3]* | ~~Inline under `/meshcore/services/`~~ → the **`#bot` channel** line in the `/config` channel box ("ask-me-anything bot"). Services page deleted. "blackbox," Meshcore-tailored; usage-over-internals. |
| **D10** | **CI / deploy** | **GitHub Actions** builds with Zola → **GitHub Pages** on push to `main` (`base_url` overridable as workflow input). **Freifunk = manual drop, no sync.** |
| **D11** | **Aesthetic** | **1990s game / terminal / CRT**, underground/hacker register, **minimal hand-written CSS**. Direction not pixel-spec; agent has latitude within bounds. **Not DWeb-branded** — our own thing. |
| **D12** | **TBC discipline** | Settings values, AI-host detail depth, agenda content, Mesh Nest hours are **team-supplied**. Rendered as **visible placeholders**, never invented. |

---

## 2. Module specs (compartmentalized — small, not monolith)

Each route is its own mini-spec: **purpose / must-contain / done-when**. Shared
chrome (header nav, footer D7, CRT CSS D11, fonts D4) lives in the base template
and is *not* repeated per page.

### M0 — Base template & shell (cross-cutting)
- **Purpose:** one HTML skeleton: `<head>` (local CSS/fonts only), header nav, footer D7, CRT styling.
- **Must:** load only local assets; footer on 100% of pages; nav reaches every §4 route.
- **Done when:** any page rendered standalone shows fonts+CSS+footer with no network calls.

### M1 — `/` splash
- **Purpose:** the front door. "JOIN THE MESH" → `/start/`. Live counters (D6). 1990s game-interface framing.
- **Must:** big CTA to `/start/`; node + message counters with graceful placeholder; the local counter JS.
- **Done when:** opens offline, CTA routes, counters show placeholder without `stats.json` and live numbers with it.

### M2 — `/start/`
- **Purpose:** fastest path to a working node; funnels into Meshcore.
- **Must:** short, sequential: pick device → flash → load camp settings → confirm join. Links into `/devices/`, `/meshcore/flash/`, `/settings/`.
- **Done when:** a reader can follow it top-to-bottom into the Meshcore flow.

### M3 — `/settings/`
- **Purpose:** dense, screenshot-friendly reference card.
- **Must:** fields **region, frequency slot, channel, preset, PSK** — each a **visible TBC placeholder** (D12). Legible (mono body, D4).
- **Done when:** card is screenshot-ready; no invented values.

### M4 — `/devices/`
- **Purpose:** the three purchasable devices.
- **Must:** **Heltec V4**, **Seeed T1000E**, **Elecrow Thinknode M1** — where to buy + one-line "pick this if…". Specs present but **secondary**; flashing/usage live under stack pages.
- **Done when:** all three covered with buy + pick line; specs don't crowd out the funnel.

### M5 — `/meshcore/` (PRIMARY) + children
- **`/meshcore/`** purpose: hub; states PRIMARY + no-bridges (D8).
- **`/meshcore/flash/`:** firmware source + flashing steps (hybrid D5).
- **`/meshcore/config/`:** presets, defaults, available channels, how to join.
- **`/meshcore/services/`:** chimney repeater (beer barn); **AI host inline** (D9); pretalx schedule announcements; bots & apps as deployed.
- **Done when:** all three children exist, route, and reflect D5/D8/D9.

### M6 — `/meshtastic/` (SUPPORTED) + children
- **`/meshtastic/`** purpose: hub; **explicit: no services run here** (D8); repeater sits next to the Meshcore repeater.
- **`/meshtastic/flash/`**, **`/meshtastic/config/`:** as M5 but no services; config notes "no services" (D8).
- **Done when:** "no services" stated; parallel/no-bridge stated.

### M7 — `/reticulum/` (EDUCATIONAL) + children
- **`/reticulum/`** purpose: hub; workshops only; no bridges (D8).
- **`/reticulum/start/`:** what Reticulum is, install, first node (stable bits real, D5).
- **`/reticulum/workshop/`:** pointer to "build a web app on Reticulum without internet."
- **Done when:** start + workshop exist; no-bridge stated.

### M8 — `/mesh-nest/`
- **Purpose:** the human escape hatch / helpdesk.
- **Must:** **tent 5**; hours **TBC**; monitoring dashboards (**PotatoMesh**, viewing the mesh from outside); **Matrix fallback prominent**.
- **Done when:** location + Matrix prominent; hours marked TBC.

### M9 — `/agenda/`
- **Purpose:** mesh sessions & workshops.
- **Must:** structure to hold a simple schedule list; **content TBC**.
- **Done when:** page holds a schedule list with TBC content marked.

### M10 — `/about/`
- **Purpose:** why this exists; underground/hacker register; **not DWeb-branded**.
- **Done when:** reads as our own thing, on-register.

### M11 — Counter runtime + `stats.json` (D6)
- **Purpose:** the only dynamic element.
- **Must:** local JS; relative `./stats.json`; committed sample; graceful failure.
- **Done when:** AC#8 holds (reads file; placeholder on absence/unreachable; no hang/spew).

### M12 — Deploy (D10)
- **Purpose:** GH Pages CI + hand-portable Freifunk build.
- **Must:** workflow builds Zola → Pages; `base_url` overridable; output dir copy-able by hand.
- **Done when:** AC build steps documented; Freifunk = manual drop noted.

---

## 3. Carried-over constraints (from the brief — restated to prevent drift)

- **No bridges** between Meshcore / Meshtastic / Reticulum; stated where relevant (D8).
- **95% static**; only splash counters dynamic, degrade gracefully (D6).
- **Small payload**; constrained camp hardware (D3/D4).
- **Footer on every page** (D7).
- **Repo:** single GitHub repo, team-only authorship, content in Markdown.

---

## 4. Open items (TEAM fills — agent does NOT invent)

1. `/settings/` values: region, freq slot, channel, preset, PSK.
2. Local AI host: how much internal detail is public.
3. Agenda content.
4. Mesh Nest hours.

---

## 5. Out of scope (this iteration)

- Real-time node map, signal coverage, per-node live status.
- Any bridge/mix between stacks.
- Services on Meshtastic.
- Reticulum interaction beyond the workshop pointer.
- CI/CD sync to the Freifunk copy.
- Reticulum hosting of the site itself.

---

## 6. Acceptance

Full, testable criteria live in **`ACCEPTANCE.md`** (written in Phase 1 after this
spec is confirmed). It mirrors brief §13 and is reviewable with zero session context.

---

## Feature: Landing Page Structure

Added 2026-06-20. Gives the existing splash/aesthetic a proper **responsive shell**:
a media-aware nav, a trimmed hero funnel, and a compact single-line footer. Scoped to
the landing shell (base template + `/` splash); route *content* is unchanged.
Decisions **F1–F4**; **F4 amends D7**. *Pending explicit sign-off (see gate below).*

| # | Decision | Choice |
|---|----------|--------|
| **F1** | **Collapsible nav (CSS-only)** | Primary nav collapses, below a content-driven width, into a **logo-triggered menu**. Mechanism: a **hidden checkbox + CSS sibling selectors** — **zero JS, no external assets** (upholds D3/D11; **S3 unchanged**). The `DWEB·MESH` brand is a **home link at wide widths and the menu toggle at narrow widths** (a breakpoint-swapped link/label pair, since one element can't be both `<a>` and `<label>`). The collapsed menu carries a **HOME** entry so narrow screens can still reach `/`. Replaces the current `flex-wrap` nav. Toggle is keyboard-operable (the checkbox stays focusable). |
| **F2** | **Splash trim + funnel** | `/` keeps **JOIN THE MESH** and the node/message HUD counters (M1/D6 intact). **Removes** the `DWEB CAMP 2026 · LoRa · OFFLINE-FIRST` sub-line and the `LAST SYNC` line. CTA renamed **`START HERE` → `START`**. Adds a secondary **BUY DEVICE** link beneath START. `counters.js` is left intact — it already guards the now-absent `#stat-updated`, so counters still degrade gracefully. (Relocating LAST SYNC elsewhere is a later feature, out of scope here.) |
| **F3** | **External buy link** *(extends D3 / ACCEPTANCE §2d)* | **BUY DEVICE → `https://dwebcamp.org/tickets`** is an external **hyperlink** (click-through), permitted by §2's asset-vs-hyperlink rule. Added to the §2(d) human-review allowlist (alongside matrix.to, device vendor links, citations). **No external asset** is introduced; `check-offline.sh` still passes. |
| **F4** | **Single-line footer** *(amends D7)* | Footer becomes one compact row of four items, in order: **Matrix `#dweb-mesh:dod.ngo`** (→ matrix.to link, unchanged) · **Tent 5 (Mesh Nest)** · **Meshcore `#dwebcamp`** · **Dashboard: `dweb.potatomesh.net`** (→ existing dashboard link). **Wide screens:** single row, vertical-line separators between items. **Narrow screens:** wraps to **up to 4 stacked lines**. **Amendment to D7:** the phrase *"when LoRa fails, this is how you reach a human"* is **removed and no longer required anywhere**. D7's load-bearing parts **remain**: footer on **every** page, in the **base template**, carrying **tent 5** + the **Matrix room/link**. Naming the Meshcore channel in chrome implies no bridge → consistent with D8. |

**Confirmation gate:** F1–F4 require explicit sign-off (`confirm all`, or call out a
number to change). On confirmation, D7's row is annotated `[amended by F4]` so the
original table never silently drifts.

---

## Feature: Site Structure (flat 7-page IA)

Added 2026-06-20. Replaces the 17-route, three-stack hierarchy with a flat,
task-oriented **7-page funnel** (device → flash → config → help), Meshcore-first.
Decisions **G1–G6**. **Amends D3 (G4), D8 (G2), D9 (G3), §2 M2–M10 (G1), D7/F4 footer
link (G1).** *Pending explicit sign-off (gate below).*

### New route map (supersedes §2 M2–M10)

| Route | From | Purpose / key content |
|---|---|---|
| `/` | keep | splash (unchanged) |
| `/start/` | reshape M2 | curated sitemap: 4 CTAs (Hardware/Flash/Config/Contact) + stack note; "Start" heading; intro + closing paras removed |
| `/hardware/` | M4 `/devices/` | 3 device cards (`Spec:` links, ext. antenna on Thinknode); 868 MHz / 500 mW warning; centered **BUY DEVICES** button → tickets; BYO → Flasher |
| `/flash/` | M5 `/meshcore/flash/` | 5 steps + **iframe** flasher (G4) + graceful note; → Config / Contact |
| `/config/` | M5 `/meshcore/config/` | EU/UK/Narrow preset box (cited, G5); channel box (6 `#channels`, scope `de-bebb`); non-functional SET PRESET / ADD CHANNELS buttons; app + MeshCLI links |
| `/workshop/` | M9 `/agenda/` | agenda template; 3 session titles + metadata only; content TBC; links removed |
| `/contact/` | M10 `/about/` + M8 `/mesh-nest/` | Mesh Nest / Tent 5 note; DoD hosting (dod.ngo); `#berlinmesh` support; dashboard; Matrix; Impressum (§5 DDG) |
| **deleted** | — | `/settings/`, `/meshcore/` hub, `/meshcore/services/`, `/meshtastic/` ×3, `/reticulum/` ×3 |

| # | Decision | Choice |
|---|----------|--------|
| **G1** | **Flat 7-page IA** *(supersedes §2 M2–M10; amends D7/F4 footer link)* | The route map above. Nav rebuilt to the new routes; footer Tent-5 link repointed `/mesh-nest/` → `/contact/` (else the `get_url` breaks the build). Deletions per the table; §5/LP-6 still hold (footer keeps `tent 5` text + Matrix link). |
| **G2** | **De-page the stacks** *(amends D8)* | Meshcore is the sole funnel. Meshtastic + Reticulum lose dedicated pages; D8's truth survives as a **`/start` note**: "Meshtastic supported · Router on `MediumFast` · camp feeds no services · protocols don't bridge · Reticulum → Workshop." No-bridge / no-services **preserved, relocated**. `Meshtastic` / `Reticulum` / `MediumFast` rendered in a highlight color. |
| **G3** | **AI host → channel** *(amends D9)* | `/meshcore/services/` deleted; the AI host becomes the **`#bot`** line in the `/config` channel box ("ask-me-anything bot"). No services page. |
| **G4** | **Scoped offline-exception for the flasher** *(amends D3)* | `/flash` embeds `<iframe src="https://flasher.meshcore.io">`. **This one host is allowlisted, scoped to `/flash` only**; every other external asset stays forbidden. `check-offline.sh` + AC#2 amended to permit exactly this. Page degrades gracefully (steps + "needs internet" note + fallback link). Online-only by nature: the offline Freifunk `/flash` flasher won't function (accepted). Build verifies the flasher's `X-Frame-Options`/CSP; if framing is blocked, revisit. |
| **G5** | **Sourced content** *(D5 / D12)* | EU/UK/Narrow preset values **looked up, then team-confirmed** (*citation/verify note removed per team 2026-06-21*). Channels supplied by the team (6 `#channels`, scope `de-bebb`). App + MeshCLI links researched. Impressum (§5 DDG) verbatim. SET PRESET / ADD CHANNELS buttons are **non-functional placeholders**, no inline "placeholder" note (wired later). |
| **G6** | **External links → new tab** | All external `<a href>` get `target="_blank"` + `rel="noopener"` (BUY DEVICE on splash + everywhere). Internal links stay host-less `get_url`. |

**Confirmation gate:** G1–G6 require explicit sign-off (`confirm all`, or call a number).
On confirmation, the D3 / D8 / D9 rows get `[amended by G4/G2/G3]` annotations so the
original decision table never silently drifts.
