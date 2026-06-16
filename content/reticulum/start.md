+++
title = "Start"
description = "What Reticulum is, how to install it, and your first node."
weight = 1
+++

## What it is
**Reticulum** (RNS) is a networking stack where every node has a cryptographic identity
and can talk over any medium — LoRa (via an RNode), packet radio, serial, Wi-Fi, TCP —
encrypted end-to-end by default. No DNS, no IP addresses to hand out, no internet required.

## Install
Reticulum is a Python package:

```
pip install rns
```

That installs the stack plus its CLI tools: `rnsd`, `rnstatus`, `rnpath`, `rnid`, `rncp`,
`rnx`, `rnodeconf`.

## Your first node
Start the daemon:

```
rnsd
```

On first run it writes a default config to `~/.reticulum/config` with basic peer
connectivity. Check status any time with:

```
rnstatus
```

To run over LoRa, edit that config and enable an **RNode** interface — the file ships with
commented examples for LoRa, TCP, UDP and packet radio.

Next → [Workshop](@/reticulum/workshop.md).

<p class="muted">Verified 2026-06-16 against <a href="https://reticulum.network">reticulum.network</a> and the <a href="https://markqvist.github.io/Reticulum/manual/">RNS manual</a>. Reticulum does not bridge to Meshcore or Meshtastic.</p>
