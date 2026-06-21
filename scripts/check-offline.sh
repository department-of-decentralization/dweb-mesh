#!/usr/bin/env sh
# Fail if the built site references any EXTERNAL asset (CDN/webfont/JS/analytics).
# External <a href> hyperlinks (Matrix, vendor links, citations) are allowed.
#
# Scans only files a browser loads/executes (markup/asset code). Prose docs
# (.md/.txt — bundled font licenses, SOURCES.md) may legitimately name a host
# (e.g. an OFL license cites scripts.sil.org) and are NOT asset references.
#
# Usage: zola build && scripts/check-offline.sh [public_dir]
set -eu
DIR="${1:-public}"
[ -d "$DIR" ] || { echo "FAIL: '$DIR' not found — run 'zola build' first." >&2; exit 2; }
fail=0
report() { echo; echo "FAIL: $1"; shift; printf '%s\n' "$@"; fail=1; }

scan() {
  grep -rEHoin \
    --include='*.html' --include='*.css' --include='*.js' \
    --include='*.svg'  --include='*.xml' \
    "$1" "$DIR" 2>/dev/null || true
}

# G4 (Feature: Site Structure): the ONE allowed external asset is the Meshcore web
# flasher iframe on /flash. Allow precisely that line; still catch everything else.
ALLOW_FLASHER='/flash/index\.html:[0-9]+:<iframe[^>]*src="https://flasher\.meshcore\.io'
hits=$(scan '<(link|script|img|source|video|audio|iframe|embed)\b[^>]*\b(src|href)=["'"'"']https?://[^"'"'"']*' | grep -Eiv "$ALLOW_FLASHER" || true)
[ -n "$hits" ] && report "external asset reference(s) in markup" "$hits"

hits=$(scan '(@import|url\()[[:space:]]*["'"'"']?https?://')
[ -n "$hits" ] && report "external CSS import/url()" "$hits"

hits=$(scan 'google-analytics|googletagmanager|gtag\(|plausible|matomo|fonts\.(googleapis|gstatic)|cdnjs|jsdelivr|unpkg|cloudflare')
[ -n "$hits" ] && report "analytics/CDN host reference(s)" "$hits"

[ "$fail" -eq 0 ] && echo "OK: no external asset references in '$DIR'."
exit "$fail"
