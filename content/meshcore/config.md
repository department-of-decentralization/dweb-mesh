+++
title = "Config"
description = "Pair, set the radio to the camp's values, join the camp channel."
weight = 2
+++

You've flashed **Companion** firmware ([Flash](@/meshcore/flash.md)). Now point it at the
camp mesh. Every camp-specific value below lives on the
**[Settings card](@/settings/_index.md)** — screenshot that first.

## 1 · Install the app
The **MeshCore companion app** — iOS, Android, or the web client.
Links: <https://meshcore.io>.

## 2 · Pair your node
Open the app and pair the board over **Bluetooth** (USB also works). Give it a display name.

## 3 · Set the radio to the camp
Set **region · frequency slot · preset** to the camp's values from the
[Settings card](@/settings/_index.md). (Meshcore ships sensible regional defaults, but
late-2025 many regions moved to a "narrow" preset — so match the card, don't assume.)

## 4 · Add the camp channel
Add the camp channel by **name + PSK** from the [Settings card](@/settings/_index.md).
There's a default public channel, but camp traffic and the chimney repeater live on the
camp channel. A node on the right frequency **and** channel is on the mesh.

> Use the **camp values only** — don't import unverified PSKs from other networks/projects.

## Confirm you're on
You should see camp contacts and be able to post to the channel. Nothing? Re-check
frequency + channel against the card character-for-character, then bring it to the
[Mesh Nest](@/mesh-nest/_index.md) (tent 5).

<p class="muted">Config flow verified 2026-06-16 against <a href="https://docs.meshcore.io">docs.meshcore.io</a>. Camp values are intentionally only on the Settings card (team-supplied, TBC).</p>

> Meshtastic config is separate and the camp runs **no services** on it; Reticulum is
> workshops-only. The stacks are **parallel — no bridges**.
