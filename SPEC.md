# SPEC — DWeb Camp 2026 Mesh Documentation Site

Status: **CONFIRMED 2026-06-16 — all 12 decisions accepted.** Domain: `dweb.dod.ngo` (root `/`).
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
| **D2** | **Dual-root / URLs** | **Single source, single build, `base_url = "/"`** → **host-less root-absolute paths** (`/start/`, `/css/…`): links carry **no domain**, so the same artifact works at GH Pages *and* on the offline Freifunk host with **no DNS dependency**. **Custom domain `dweb.dod.ngo`** (committed `CNAME`) serves GH Pages at root; **the same build is the Freifunk manual drop**. One build, both targets. *(If ever subpath-scoped, `base_url` is the single switch + rebuild — all refs go through `get_url`. Link checker keeps refs honest.)* |
| **D3** | **Self-contained** | **Zero external references.** No CDN, webfont, external JS, analytics, remote anything. Enforced by a grep gate in ACCEPTANCE. Every byte ships in the repo. |
| **D4** | **Typography** | **Bundled OFL pixel font for display/chrome** (candidate: *Press Start 2P*) **+ bundled OFL monospace for body & the `/settings/` card** (candidate: a small legible OFL mono, final pick at build). Both self-hosted (`woff2`), subset where it helps payload. |
| **D5** | **Content depth** | **Hybrid.** Real, **dated + sourced** instructions for *stable* procedures (e.g. Meshtastic web-flasher flow, Reticulum `pip` install); **visible TBC placeholders** for *volatile / camp-private* items (Meshcore firmware specifics, exact presets, PSK). Light web research for the stable parts; team reviews before camp. |
| **D6** | **Live counters** | Vanilla JS (no framework, local, tiny) fetches **`./stats.json`** (site-root relative). **Commit a sample** `stats.json` = `{nodes:0, messages:0, updated:<ISO>}`. On any fetch failure → **static placeholder**, no spinner, no error spew. Mesh Nest box overwrites the file live. |
| **D7** | **Footer (every page)** | Lives in the base template. **Mesh Nest, tent 5** + **Matrix `#dweb-mesh:dod.ngo` → `https://matrix.to/#/#dweb-mesh:dod.ngo`**. Phrasing: *"when LoRa fails, this is how you reach a human."* |
| **D8** | **Three stacks, no bridges** | Parallel + independent; **stated on each stack page**. **Meshcore = PRIMARY**, **Meshtastic = SUPPORTED** (explicit: *no services run here*), **Reticulum = EDUCATIONAL** (workshops only, no bridges). |
| **D9** | **AI host** | **Inline line item** under `/meshcore/services/` (not its own page). "blackbox," Meshcore-tailored. Default **usage-over-internals**; public detail depth **TBC** (team fills). |
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
