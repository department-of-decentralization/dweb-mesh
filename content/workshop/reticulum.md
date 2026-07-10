+++
title = "Reticulum Workshop"
description = "Resources for the Reticulum workshop at DWeb Camp Berlin 2026."
+++

### Prerequesites

You need Python and `pip`. Best to create a virtual environment for managing all binaries.

```
python -m venv ~/.venv
source ~/.venv/bin/activate
pip install --upgrade pip rns nomadnet
```

To use the RNode as non-root user, add yourself to the group `uucp` or `dialout`.

```
usermod -aG uucp $USER
newgrp uucp
```

MacOS:

```
dseditgroup -o edit -a $USER -t user wheel
```

### Configuration

Reticulum configuration for Berlin (LoRa) `~/.reticulum/config`

```
[reticulum]
  enable_transport = Yes
  share_instance   = Yes

[interfaces]
  [[RNode Reticulum Berlin]]
    type            = RNodeInterface
    enabled         = yes
    port            = /dev/ttyACM0
                    # /dev/ttyUSB0
                    # /dev/cu.ubmodem11201
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
node_name = DWeb Node 1337
announce_interval = 360
announce_at_start = Yes
disable_propagation = No
propagation_cost = 16
```

### Tools

- `rnstatus`
- `rnpath -t`
- `rnodeprobe <hash>`

### Micron



### Terminology

- **LXMF**: lightweight extensible message format (message transport layer)
- **RNode**: radio transciever firmware (host controlled)
- **Transport Node**: enable routing (for other nodes to pass packages through your node)
- **Propagation Node**: enable store-and-forward for nodes that are offline
