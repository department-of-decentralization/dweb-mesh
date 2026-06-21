/* mesh-provision.js — wires the /config SET PRESET / ADD CHANNELS buttons to a USB
   MeshCore *companion* node over WebSerial. Client-side only, no backend. Companion
   firmware only (companion_radio_usb) — not repeaters/room servers (those speak a
   text CLI; companions speak the binary companion protocol). No browser storage. */
import { WebSerialConnection, TransportKeyUtil } from "./vendor/meshcore.min.js";

// EU/UK (Narrow). freq = MHz*1000, bw = kHz*1000. tx max is 22 (27 is rejected).
const PRESET = { freq: 869618, bw: 62500, sf: 8, cr: 8, tx: 22 };
const SCOPE  = "de-bebb"; // hashed as "#de-bebb"; persisted scope uses the first 16 bytes of that hash
const HANDSHAKE_TIMEOUT_MS = 12000; // bound the device-query handshake (it has none of its own)
const CMD_TIMEOUT_MS = 5000;        // bound each raw command-frame Ok/Err wait

// Persisted device commands meshcore.js@1.13.0 has no wrapper for — framed by hand and sent
// via conn.sendToRadioFrame. Both call savePrefs() on the device, unlike the RAM-only
// flood-scope override (CMD 54) used before, which was lost on reboot. ResponseCodes: Ok=0, Err=1.
const CMD_SET_DEFAULT_FLOOD_SCOPE = 63; // frame [63][31B name \0-padded][16B key] (48 bytes)
const CMD_SET_PATH_HASH_MODE      = 61; // frame [61][0][mode]; prefix bytes = mode + 1
const PATH_HASH_MODE = 1;               // mode 1 -> 2-byte path-hash prefix (valid 0..2)

const CHANNELS = [
  { idx: 1, name: "#dwebcamp",          key: "b8769b859a18cb47fa326c79bc04e2da" },
  { idx: 2, name: "#schedule",          key: "03a5bab42c9d3535b69f259f338be9ea" },
  { idx: 3, name: "#workshop",          key: "3862ef52df5e5966eb10751b83788bc5" },
  { idx: 4, name: "#bot",               key: "eb50a1bcb3e4e5d7bf69a57c9dada211" },
  { idx: 5, name: "#berlinmesh",        key: "c5ead1d8a7647a63fd37d156cdc3e257" },
  { idx: 6, name: "#berlinbrandenburg", key: "625ff2a308bbe3a4c90da77979b7a4fc" },
];

const hexToBytes = (h) => Uint8Array.from(h.match(/../g).map((b) => parseInt(b, 16)));
const bytesToHex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
const msg = (e) => (e && e.message) ? e.message : String(e);

// Raw persisted-command frames (see CMD_* above).
function frameDefaultFloodScope(name, key16) {
  const nameBytes = new TextEncoder().encode(name);
  if (nameBytes.length < 1 || nameBytes.length > 30) { throw new Error("scope name must be 1..30 bytes"); }
  if (!key16 || key16.length !== 16) { throw new Error("scope key must be 16 bytes"); }
  const f = new Uint8Array(48);                // [63][31B name, null-padded][16B key]
  f[0] = CMD_SET_DEFAULT_FLOOD_SCOPE;
  f.set(nameBytes, 1);
  f.set(key16, 32);
  return f;
}
function framePathHashMode(mode) {
  return new Uint8Array([CMD_SET_PATH_HASH_MODE, 0, mode]); // [61][0][mode]
}

// Send a raw command frame; resolve on the device's Ok (0), reject on Err (1) or timeout.
// Mirrors meshcore's own command wrappers, for commands the library doesn't expose.
function sendRaw(conn, frame, ms) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = () => { conn.off(0, onOk); conn.off(1, onErr); };
    const onOk = () => { if (!settled) { settled = true; cleanup(); resolve(); } };
    const onErr = () => { if (!settled) { settled = true; cleanup(); reject(new Error("device returned Err")); } };
    conn.on(0, onOk);   // ResponseCodes.Ok
    conn.on(1, onErr);  // ResponseCodes.Err
    setTimeout(() => { if (!settled) { settled = true; cleanup(); reject(new Error("no Ok/Err from device for command")); } }, ms);
    Promise.resolve(conn.sendToRadioFrame(frame)).catch((e) => { if (!settled) { settled = true; cleanup(); reject(e); } });
  });
}

// Resolve on the "connected" handshake; reject on disconnect or timeout so the caller
// never hangs (meshcore's onConnected awaits a device query with no timeout of its own).
function waitConnected(conn, ms) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const done = (fn, arg) => { if (!settled) { settled = true; fn(arg); } };
    conn.once("connected", () => done(resolve));
    conn.once("disconnected", () => done(reject, new Error("device disconnected during handshake")));
    setTimeout(() => done(reject, new Error("no response from device — handshake timed out (is it running Companion USB firmware? try unplug/replug)")), ms);
  });
}

// meshcore's WebSerialConnection.close() calls reader.releaseLock() while a read is
// still pending (that throws, so the port never fully closes), which wedges the next
// open() on ESP32-S3 native-USB devices. Cancel the read first so the readable unlocks
// cleanly, then let close() release the port. (Node's transport closes cleanly, which
// is why /dev/ttyACM0 reopens fine but the browser did not.)
async function hardClose(conn) {
  try { if (conn && conn.reader) { await conn.reader.cancel(); } } catch (e) { /* ignore */ }
  try { await conn.close(); } catch (e) { /* ignore */ }
}

// Opens the port picker (MUST run inside a click handler), waits for the handshake,
// runs fn, then ALWAYS closes — even on failure — so the next click can reopen.
async function withDevice(fn, log) {
  if (!navigator.serial) { log("Web Serial unsupported. Use Chrome/Edge/Brave on desktop over HTTPS."); return; }
  log("requesting serial port…");
  let conn;
  try {
    conn = await WebSerialConnection.open();              // navigator.serial.requestPort() + open @115200
  } catch (e) {
    log("could not open port: " + msg(e));                // user cancelled, or port already open elsewhere
    return;
  }
  if (!conn) { log("Web Serial unsupported."); return; }
  log("port open — waiting for device…");
  try {
    await waitConnected(conn, HANDSHAKE_TIMEOUT_MS);
    log("connected");
    await fn(conn, log);
  } finally {
    await hardClose(conn);
    log("port closed");
  }
}

// Button 1: radio params -> tx power -> flood scope -> name (only if still the default).
export async function setPreset(log) {
  await withDevice(async (conn) => {
    await conn.setRadioParams(PRESET.freq, PRESET.bw, PRESET.sf, PRESET.cr);
    log("radio 869.618 MHz / 62.5 kHz / SF8 / CR8");
    await conn.setTxPower(PRESET.tx);
    log("tx " + PRESET.tx + " dBm");
    // Persisted default flood scope (CMD 63, savePrefs) — replaces the RAM-only CMD 54
    // that was lost on reboot. Key = first 16 bytes of SHA-256("#de-bebb").
    const key16 = (await TransportKeyUtil.getHashtagRegionKey(SCOPE)).slice(0, 16);
    await sendRaw(conn, frameDefaultFloodScope(SCOPE, key16), CMD_TIMEOUT_MS);
    log("flood scope " + SCOPE + " (persisted)");
    // 2-byte path-hash prefix (CMD 61, savePrefs).
    await sendRaw(conn, framePathHashMode(PATH_HASH_MODE), CMD_TIMEOUT_MS);
    log("path-hash prefix " + (PATH_HASH_MODE + 1) + " bytes");
    // Name the node if it still carries the firmware default (its public-key hex
    // prefix, e.g. "3DAC71E2") -> "DWeb 3DAC". Leave a user-chosen name alone.
    const info = await conn.getSelfInfo();
    const pkHex = bytesToHex(info.publicKey).toUpperCase();
    const cur = (info.name || "").trim();
    if (cur === "" || (/^[0-9A-Fa-f]+$/.test(cur) && pkHex.startsWith(cur.toUpperCase()))) {
      const newName = "DWeb " + pkHex.slice(0, 4);
      await conn.setAdvertName(newName);
      log("name -> " + newName);
    } else {
      log("name kept: " + cur);
    }
    // Optional radio re-init. WARNING: reboot() resets the device and the USB link drops.
    // await conn.reboot();
    log("preset done");
  }, log);
}

// Button 2: write the six hashtag channels into slots 1-6. Slot 0 (public) is left alone.
export async function addChannels(log) {
  await withDevice(async (conn) => {
    for (const ch of CHANNELS) {
      try { // read-before-write: warn, don't silently clobber a user's existing channel
        const cur = await conn.getChannel(ch.idx);
        const name = (cur && cur.name ? cur.name : "").replace(/\0+$/, "");
        if (name && name !== ch.name) log('slot ' + ch.idx + ' held "' + name + '", overwriting');
      } catch (e) { /* empty slot, fine */ }
      await conn.setChannel(ch.idx, ch.name, hexToBytes(ch.key));
      log("slot " + ch.idx + " = " + ch.name);
    }
    log("channels done");
    // announce on the mesh so the flashing team gets live feedback: advert first, message last.
    const info = await conn.getSelfInfo();
    const nodeName = ((info && info.name) ? info.name : "").trim() || "node";
    await conn.sendFloodAdvert();
    log("advert sent");
    const bot = CHANNELS.find((c) => c.name === "#bot");
    await conn.sendChannelTextMessage(bot.idx, "flashed " + nodeName);
    log("posted to #bot: flashed " + nodeName);
  }, log);
}

// --- page wiring: each button has its own log terminal that opens on click ---
(function () {
  const btnPreset = document.getElementById("btn-preset");
  const btnChannels = document.getElementById("btn-channels");
  const elPreset = document.getElementById("out-preset");
  const elChannels = document.getElementById("out-channels");

  function reveal(el, text) { if (el) { el.hidden = false; el.textContent = text; } }
  function wire(btn, el, fn) {
    if (!btn) return;
    btn.onclick = function () {
      reveal(el, "");                                  // open the terminal + clear prior output
      btn.disabled = true;                             // block re-entry while one run holds the port
      const log = (m) => { if (el) { el.textContent += m + "\n"; el.scrollTop = el.scrollHeight; } };
      fn(log).catch((e) => log("error: " + msg(e))).finally(() => { btn.disabled = false; });
    };
  }

  if (!navigator.serial) {
    const note = "Web Serial unsupported. Provisioning needs a Chromium browser (Chrome/Edge/Brave) over HTTPS or localhost. On a phone or over Bluetooth, use the MeshCore app.";
    if (btnPreset) { btnPreset.disabled = true; }
    if (btnChannels) { btnChannels.disabled = true; }
    reveal(elPreset, note);
    reveal(elChannels, note);
    return;
  }
  wire(btnPreset, elPreset, setPreset);
  wire(btnChannels, elChannels, addChannels);
})();
