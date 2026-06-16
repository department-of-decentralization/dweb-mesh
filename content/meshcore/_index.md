+++
title = "Meshcore"
description = "PRIMARY stack — flash, config, and the services the camp runs."
sort_by = "weight"
+++

**Meshcore is the camp's primary stack.** It's a lightweight LoRa mesh protocol with
structured routing: your phone pairs to a node over Bluetooth and you message across
camp — no internet, no cell. Flash it, load the [camp settings](@/settings/_index.md),
and you're on.

This is also where the camp runs **services** — the chimney repeater, schedule
announcements, and a local AI host. Meshtastic is supported separately, and Reticulum
is educational: the three stacks are **parallel and do not bridge**.
