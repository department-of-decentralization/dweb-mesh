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

- `rnstatus`: status of your reticulum network stack interfaces
- `rnpath -t`: list known nodes and paths by hashs and hops
- `rnodeprobe <hash>`: check connection and path to node by hash

### Micron

Micron is the markup for Nomad pages (`.mu` files). Every tag begins with a
backtick `` ` ``.

~~~
FORMATTING              (toggles: same tag opens and closes)
  `!bold`!              bold
  `_underline`_         underline
  `*italic`*            italic
  ``                    reset ALL formatting  (two backticks)

COLOR                   three hex digits, one per R/G/B channel — like CSS #rgb
  `Ff00 text            red foreground
  `f                    reset foreground
  `B002 text            dark-blue background
  `b                    reset background

ALIGNMENT               put at the start of the line
  `c                    center
  `l                    left
  `r                    right
  `a                    default

STRUCTURE
  >Heading              section heading   (>> deeper, >>> deeper still)
  -                     horizontal divider (alone on its line)
  `[label`dest]         link  ->  dest = <hash>:/page/index.mu  or  #anchor
  `[lxmf@<hash>]        open conversation with an LXMF peer
~~~

### Dynamic Content

Create a `rand.mu` and make it executable, link it, share it.

```python
#!/usr/bin/env python3
import random, time

tick = int(time.time()) % 60
roll = random.randint(0, 99)

print(">Dynamic Python demo\n")
print("Hello, World!\n")
print(f"Unix seconds mod 60: `!{tick}`!\n")
print(f"Random roll (0-99): `!{roll}`!\n")
print("Reload the page. The node reruns the script, the numbers change.")
```

### Terminology

- **LXMF**: lightweight extensible message format (message transport layer)
- **RNode**: radio transciever firmware (host controlled)
- **Transport Node**: enable routing (for other nodes to pass packages through your node)
- **Propagation Node**: enable store-and-forward for nodes that are offline
