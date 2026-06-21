+++
title = "Config"
description = "Set the EU/UK/Narrow Meshcore preset and join the camp channels."
+++

You have hardware with Meshcore ready? Let's get you set up on the `EU/UK/Narrow` preset and add all the relevant channels.

<p class="btn-row"><button type="button" class="btn">SET PRESET</button></p>
<p class="cap">This sets your device to the <code>EU/UK/Narrow</code> Meshcore preset and default scope to <code>de-bebb</code> (Berlin/Brandenburg).</p>

### EU/UK/Narrow

<div class="refcard">
  <div class="refcard-row"><span class="refcard-k">Frequency</span><span>869.618 MHz</span></div>
  <div class="refcard-row"><span class="refcard-k">Bandwidth</span><span>62.5 kHz</span></div>
  <div class="refcard-row"><span class="refcard-k">Spreading factor</span><span>SF 8</span></div>
  <div class="refcard-row"><span class="refcard-k">Coding rate</span><span>4/8</span></div>
  <div class="refcard-row"><span class="refcard-k">TX power</span><span>22 dBm (default)</span></div>
  <div class="refcard-row"><span class="refcard-k">Scope</span><span>de-bebb</span></div>
</div>

<p class="btn-row"><button type="button" class="btn">ADD CHANNELS</button></p>
<p class="cap">This adds the DWebCamp hashtag channels to your device.</p>

| Channel | Scope | Description |
|---|---|---|
| `#dwebcamp` | `de-bebb` | DWebCamp main public channel |
| `#schedule` | `de-bebb` | schedule for the DWebCamp stages |
| `#workshop` | `de-bebb` | for the RF Mesh → [Workshop](@/workshop/_index.md) |
| `#bot` | `de-bebb` | an ask-me-anything bot answering your questions |
| `#berlinmesh` | `de-bebb` | the Berlin local Chaos Mesh community and meetup |
| `#berlinbrandenburg` | `de-bebb` | the Berlin/Brandenburg regional channel |

## Apps

- **iOS** — <a href="https://apps.apple.com/app/meshcore/id6742354151" target="_blank" rel="noopener">MeshCore on the App Store</a>
- **Android** — <a href="https://play.google.com/store/apps/details?id=com.liamcottle.meshcore.android" target="_blank" rel="noopener">MeshCore on Google Play</a>
- **Linux / macOS** — <a href="https://github.com/meshcore-dev/meshcore-cli" target="_blank" rel="noopener">MeshCLI (meshcore-cli)</a>, installed with <code>pipx install meshcore-cli</code>
