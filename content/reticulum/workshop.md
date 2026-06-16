+++
title = "Workshop"
description = "Off the grid: build an app on Reticulum over LoRa — the confirmed camp workshop."
weight = 2
+++

**Off the grid: build an app that runs over radio on Reticulum (LoRa).**

This is the confirmed camp workshop. Write software that survives without the internet —
[Reticulum](@/reticulum/_index.md) carries it over LoRa, packet radio, or anything else that
moves data: every node self-identifies, every packet is encrypted and authenticated, no
servers, no IP, no DNS.

In the hour we build a small application together and run it over real LoRa hardware on site,
inside the EU **868 MHz** duty cycle. We cover the core primitives — **identity, destination,
link, resource** — plus **LXMF** for store-and-forward messaging, and how to expose a service
other nodes can discover and reach. Working examples are in Python; the patterns translate
directly to Rust or C. What you build can also be served over the Freifunk wifi, or the
internet, after the session.

The classic shape is a tiny web-style app — pages served over encrypted mesh links with no
internet at all, via **Nomad Network**:

```
pip install rns nomadnet
rnsd        # bring up the stack (writes ~/.reticulum/config)
nomadnet    # host and browse pages over Reticulum
```

**Bring a laptop.** Some programming experience assumed; no radio background needed. Devices
and radios are available on site from **€20**. Time and room: see the
[Agenda](@/agenda/_index.md) — accepted, not yet scheduled.

> Reticulum is **educational / workshops only** and does **not bridge** to Meshcore or
> Meshtastic.

<p class="muted">Session confirmed for DWeb Camp Berlin 2026. Verified 2026-06-16 against the Reticulum / Nomad Network projects.</p>
