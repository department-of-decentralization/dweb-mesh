# CLAUDE.md — DWeb Camp 2026 Mesh Docs

Static **Zola** site. The one rule everything else serves:
**render fully with zero upstream internet, and stay portable by hand-copy.**

Authority: `SPEC.md` (confirmed decisions D1–D12) and `ACCEPTANCE.md` (runnable
pass/fail). Do not contradict a confirmed decision without re-confirming with the team.

## Non-negotiable constraints
- **No external assets, ever.** No CDN, webfont, external JS, analytics, remote
  anything. Every byte is local. One external asset = a broken page on the offline
  Freifunk copy. Run `scripts/check-offline.sh` before every commit.
- **Host-less root paths.** `base_url = "/"`; all links/assets via Zola `get_url`
  → `/path/`, never `https://mesh.dod.ngo/...` hard-coded.
- **Footer on every page.** Mesh Nest tent 5 + Matrix `#dweb-mesh:dod.ngo`. It lives
  in the base template — never strip it per page.
- **Three stacks, no bridges.** Meshcore (PRIMARY), Meshtastic (SUPPORTED, no
  services), Reticulum (EDUCATIONAL). State "no bridges" where relevant; never doc interop.
- **TBC discipline.** Settings values, AI-host depth, agenda, hours are team-supplied.
  Render visible TBC placeholders; never invent.

## Build & verify
    zola build                                   # → ./public
    cd public && python3 -m http.server 8000     # serve offline at root
    scripts/check-offline.sh                     # MUST pass before commit
    zola build --base-url /dweb-mesh/ -o public_sub   # subpath portability check

## Content
- Markdown in `content/`. Hybrid depth: real *dated + sourced* steps for stable
  procedures; TBC for volatile/camp-private. Aesthetic: 1990s CRT/terminal, minimal
  hand-written CSS, bundled OFL pixel + mono fonts. Not DWeb-branded.

## Deploy
- GitHub Pages via CI (`.github/workflows/`), custom domain `mesh.dod.ngo` (`CNAME`).
- Freifunk = **manual drop** of `public/`. No sync.
