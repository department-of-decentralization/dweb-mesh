+++
title = "Flash"
description = "Get Meshcore onto your board with the web flasher."
weight = 1
+++

Most attendees want the **Companion** role — a node your phone drives over Bluetooth.
Repeaters and room servers are different roles in the same flasher (see
[Services](@/meshcore/services.md)).

## Web flasher (easiest)
1. Plug your board into a computer over **USB**.
2. Open the MeshCore web flasher: **<https://flasher.meshcore.io>** (use Chrome or Edge — it needs Web Serial).
3. Select your board — Heltec V4, Seeed T1000-E, Elecrow ThinkNode M1, and others are listed.
4. Choose the **Companion (BLE)** firmware and flash. Keep the cable in and **do not refresh** the page until it finishes.
5. Reboot the board when prompted.

> **nRF boards (T1000-E, ThinkNode M1):** if the flasher can't find the port, put the
> board in its bootloader (double-tap reset, or follow the on-screen prompt) and retry.

Next → [Config & joining](@/meshcore/config.md).

<p class="muted">Flasher flow verified 2026-06-16 against <a href="https://flasher.meshcore.io">flasher.meshcore.io</a> and <a href="https://docs.meshcore.io">docs.meshcore.io</a>. Firmware versions move fast — take the current stable build unless the Mesh Nest says otherwise.</p>

> Building a repeater or room server? Same flasher, different role —
> [Services](@/meshcore/services.md). No bridges to Meshtastic or Reticulum.
