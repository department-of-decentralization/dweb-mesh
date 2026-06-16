#!/usr/bin/env python3
# PreToolUse(Bash) defense-in-depth: block catastrophic commands prefix rules miss
# (e.g. chained after cd/&&). Exit 2 blocks the tool call; exit 0 allows.
import sys, json, re

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)  # fail-open on unparseable input; prefix deny rules still apply

cmd = (data.get("tool_input") or {}).get("command", "")

PATTERNS = [
    (r'rm\s+-[a-z]*[rf][a-z]*\s+(--\s+)?(-[a-z]*\s+)*/(?:\s|$)', "rm -rf at filesystem root"),
    (r'git\s+push\s+.*(--force(?!-with-lease)\b|-f\b)', "git force-push"),
    (r'git\s+reset\s+--hard', "git reset --hard"),
]

for pat, why in PATTERNS:
    if re.search(pat, cmd):
        print(f"BLOCKED by guard-bash: {why}", file=sys.stderr)
        sys.exit(2)

sys.exit(0)
