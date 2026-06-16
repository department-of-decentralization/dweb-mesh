+++
title = "Devices"
description = "Three boards known-good for the camp mesh: buy one, then flash it."
+++

Three boards are known-good for the camp mesh. Pick by **how you want to carry it**,
then flash it — flashing and usage live under each stack, not here.

<div class="devices">

  <div class="device">
    <h3>Heltec V4</h3>
    <p class="pick">Pick this if: you want the cheap, hackable dev board with a screen and don't mind adding a battery.</p>
    <p class="specs">ESP32-S3 + SX1262 · 0.96″ OLED · USB-C · Wi-Fi + BLE · 863–928 MHz (868 EU) · 28 dBm high-power variant.</p>
    <p class="buy"><a href="https://heltec.org/project/wifi-lora-32-v4/">heltec.org &rarr;</a></p>
  </div>

  <div class="device">
    <h3>Seeed T1000-E</h3>
    <p class="pick">Pick this if: you want a sealed, card-sized tracker with GPS and battery — pocket it and go.</p>
    <p class="specs">nRF52840 + LR1110 · GNSS · no screen (phone-configured) · 85×55×6.5 mm · IP65 · 700 mAh · BLE 5.0 · 863–928 MHz.</p>
    <p class="buy"><a href="https://www.seeedstudio.com/SenseCAP-Card-Tracker-T1000-E-for-Meshtastic-p-5913.html">seeedstudio.com &rarr;</a></p>
  </div>

  <div class="device">
    <h3>Elecrow ThinkNode M1</h3>
    <p class="pick">Pick this if: you want a ready-to-use handheld with a sunlight-readable e-paper screen, GPS and battery.</p>
    <p class="specs">nRF52840 + SX1262 · GPS · 1.54″ e-paper · 1200 mAh · BLE · 868/915 MHz · enclosure included.</p>
    <p class="buy"><a href="https://www.elecrow.com/thinknode-m1-meshtastic-lora-signal-transceiver-powered-by-nrf52840-with-154-screen-support-gps.html">elecrow.com &rarr;</a></p>
  </div>

</div>

> **Buy the right band.** Order the variant that matches the camp region (see
> [Settings](@/settings/_index.md)). Unsure? Ask at the [Mesh Nest](@/mesh-nest/_index.md).

> **Flashing lives under the stacks.** These boards are sold for Meshtastic; the camp
> runs **Meshcore** as primary, so flash that — [Meshcore → Flash](@/meshcore/flash.md).
> No bridges between stacks.

<p class="muted">Specs verified 2026-06-16 from the manufacturer pages linked above. Price and availability vary by region and reseller.</p>
