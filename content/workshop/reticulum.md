+++
title = "Reticulum Workshop"
description = "Resources for the Reticulum workshop at DWeb Camp Berlin 2026."
+++


Reticulum configuration for Berlin (LoRa) `~/.reticulum/config`

```
[reticulum]
  enable_transport = Yes
  share_instance   = Yes

[interfaces]
  [[RNode Reticulum Berlin]]
    type            = RNodeInterface
    enabled         = yes
    port            = /dev/serial/by-id/usb-Espressif_USB_JTAG_serial_debug_unit_F8:5B:1B:A3:7A:0C-if00
    frequency       = 869475000
    bandwidth       = 125000
    spreadingfactor = 7
    codingrate      = 5
    txpower         = 27
```

Nomadnet configuration: `~/.nomadnetwork/config`

```
[node]

enable_node = Yes
node_name = Afri Thinkpad L13
announce_interval = 360
announce_at_start = Yes
disable_propagation = No
propagation_cost = 16
```
