+++
title = "Config"
description = "Presets, channels, joining — and the explicit no-services note."
weight = 2
+++

## Install the app
The Meshtastic app — Android, Apple, Web, or the Python CLI. See <https://meshtastic.org>.

## Pair & set region
Pair the node over **Bluetooth** (or USB) and **set your region** to the camp's region.
The default preset is *LongFast*; match whatever the camp is using.

## Join a channel
Meshtastic shares channels by **QR code / channel URL** — scanning one applies the channel
and all LoRa settings in a single step. If the camp posts a Meshtastic QR, use it (ask the
[Mesh Nest](@/mesh-nest/_index.md)); otherwise the default public channel is fine for peer
chat.

> **No services run here.** This is the explicit, load-bearing note: the camp provides a
> Meshtastic repeater for coverage and **nothing else** — no bots, no AI host, no schedule
> feed. For services, use [Meshcore](@/meshcore/_index.md).

> Camp Meshtastic specifics (region / QR), if any: **TBC** — team-supplied. The stacks are
> **parallel; no bridges** between Meshtastic, Meshcore and Reticulum.

<p class="muted">Flow verified 2026-06-16 against meshtastic.org. Any camp-specific values are team-supplied (TBC).</p>
