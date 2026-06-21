+++
title = "Config"
description = "Set the EU/UK (Narrow) Meshcore preset and join the camp channels."
+++

You have hardware with <span class="hi">Meshcore</span> ready? Let's get you set up on the `EU/UK (Narrow)` preset and add all the relevant channels.

<p class="btn-row"><button type="button" class="btn" id="btn-preset">SET PRESET</button></p>
<pre id="out-preset" class="provision-log" aria-live="polite" hidden></pre>
<p class="muted">This sets your device to the <code>EU/UK (Narrow)</code> Meshcore preset and default scope to <code>de-bebb</code> (Berlin/Brandenburg).</p>

<div class="refcard">
  <div class="refcard-row"><span class="refcard-k">Frequency</span><span>869.618 MHz</span></div>
  <div class="refcard-row"><span class="refcard-k">Bandwidth</span><span>62.5 kHz</span></div>
  <div class="refcard-row"><span class="refcard-k">Spreading factor</span><span>SF 8</span></div>
  <div class="refcard-row"><span class="refcard-k">Coding rate</span><span>4/8</span></div>
  <div class="refcard-row"><span class="refcard-k">TX power</span><span>22 dBm (default)</span></div>
  <div class="refcard-row"><span class="refcard-k">Scope</span><span>de-bebb</span></div>
</div>

<p class="btn-row"><button type="button" class="btn" id="btn-channels">ADD CHANNELS</button></p>
<pre id="out-channels" class="provision-log" aria-live="polite" hidden></pre>
<p class="muted">This adds the DWebCamp hashtag channels to your device.</p>

| Channel | Scope | Description |
|---|---|---|
| <a class="chan-link" href="meshcore://channel/add?name=%23dwebcamp&secret=b8769b859a18cb47fa326c79bc04e2da">#dwebcamp</a> | `de-bebb` | DWebCamp main public channel |
| <a class="chan-link" href="meshcore://channel/add?name=%23schedule&secret=03a5bab42c9d3535b69f259f338be9ea">#schedule</a> | `de-bebb` | schedule for the DWebCamp stages |
| <a class="chan-link" href="meshcore://channel/add?name=%23workshop&secret=3862ef52df5e5966eb10751b83788bc5">#workshop</a> | `de-bebb` | for the RF Mesh → [Workshop](@/workshop/_index.md) |
| <a class="chan-link" href="meshcore://channel/add?name=%23bot&secret=eb50a1bcb3e4e5d7bf69a57c9dada211">#bot</a> | `de-bebb` | an ask-me-anything bot answering your questions |
| <a class="chan-link" href="meshcore://channel/add?name=%23berlinmesh&secret=c5ead1d8a7647a63fd37d156cdc3e257">#berlinmesh</a> | `de-bebb` | the Berlin local Chaos Mesh community and meetup |
| <a class="chan-link" href="meshcore://channel/add?name=%23berlinbrandenburg&secret=625ff2a308bbe3a4c90da77979b7a4fc">#berlinbrandenburg</a> | `de-bebb` | the Berlin/Brandenburg regional channel |

<p class="muted">USB companion nodes only, in a Chromium browser over HTTPS. On a phone or over Bluetooth, use the MeshCore app.</p>
<script type="module" src="../js/mesh-provision.js"></script>

## Apps

- **iOS** - <a href="https://apps.apple.com/app/meshcore/id6742354151" target="_blank" rel="noopener">MeshCore on the App Store &#8599;</a>
- **Android** - <a href="https://play.google.com/store/apps/details?id=com.liamcottle.meshcore.android" target="_blank" rel="noopener">MeshCore on Google Play &#8599;</a>
- **Linux / macOS** - <a href="https://github.com/meshcore-dev/meshcore-cli" target="_blank" rel="noopener">MeshCLI (meshcore-cli) &#8599;</a>, installed with <code>pipx install meshcore-cli</code>

<details class="collapse">
<summary>Meshtastic</summary>
<a class="qr-link" href="https://meshtastic.org/e/?add=true#CgcSAQE6AggNCi4SIDZoexKKD9k7HPu6bz8Fy3BAw7mIZPnwaNhi52wNWNbIGgpCZXJsaW5NZXNoCgkSAQEaBFRFU1QKCBIBARoDU09TCjASIHMvAwYpqMS7ogQ1s_2-3KxOmgkMAsue6BUvBPOnOL1FGghEV2ViQ2FtcCgBMAESIAgBEAQY-gEgCSgFOANAB0gBUBtgAWgBwAYByAYB0AYC" target="_blank" rel="noopener"><img class="qr" src="../img/meshtastic-berlin.png" alt="QR code linking to the Meshtastic preset and channels for DWeb Camp (Berlin)" width="840" height="840"></a>
<p class="muted">Scan with the Meshtastic app to load the DWeb Camp preset + channels, or <a href="https://meshtastic.org/e/?add=true#CgcSAQE6AggNCi4SIDZoexKKD9k7HPu6bz8Fy3BAw7mIZPnwaNhi52wNWNbIGgpCZXJsaW5NZXNoCgkSAQEaBFRFU1QKCBIBARoDU09TCjASIHMvAwYpqMS7ogQ1s_2-3KxOmgkMAsue6BUvBPOnOL1FGghEV2ViQ2FtcCgBMAESIAgBEAQY-gEgCSgFOANAB0gBUBtgAWgBwAYByAYB0AYC" target="_blank" rel="noopener">open the import link &#8599;</a>.</p>
<p>Full config: <a href="https://codeberg.org/berlinmesh/meshtastic/src/branch/main/berlin.yml" target="_blank" rel="noopener">Codeberg: meshtastic/berlin.yml &#8599;</a></p>
</details>

<details class="collapse">
<summary>Reticulum</summary>
<pre><code>[[RNode Reticulum Berlin]]
  type = RNodeInterface
  enabled = yes
  frequency = 869475000
  bandwidth = 125000
  spreadingfactor = 7
  codingrate = 5
  txpower = 22</code></pre>
<p>More info: <a href="https://forum.chaosmesh.net/topic/72/preset-reticulum-berlin-869.475mhz-125khz-sf-7-cr-5" target="_blank" rel="noopener">Berlin Chaos Mesh: Reticulum Berlin 869.475 MHz / 125 kHz / SF 7 / CR 5 &#8599;</a></p>
</details>
