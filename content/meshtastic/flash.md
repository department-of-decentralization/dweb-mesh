+++
title = "Flash"
description = "Flash Meshtastic with the official web flasher."
weight = 1
+++

Meshtastic has a polished web flasher — this is the easy path.

## Web flasher
1. Plug your board in over **USB**.
2. Open **<https://flasher.meshtastic.org>** in **Chrome or Edge** (it needs Web Serial / Web USB).
3. Select your device and the current stable firmware, then flash. Keep the cable in until it finishes.
4. Reboot when prompted.

> nRF boards (Seeed T1000-E, Elecrow ThinkNode M1) may need their bootloader — double-tap
> reset — before the flasher can see them.

Next → [Config & joining](@/meshtastic/config.md).

<p class="muted">Flasher verified 2026-06-16 against <a href="https://flasher.meshtastic.org">flasher.meshtastic.org</a> / <a href="https://meshtastic.org">meshtastic.org</a>. Take the current stable build.</p>

> Reminder: Meshtastic is **supported but runs no camp services**, and does **not bridge**
> to Meshcore or Reticulum.
