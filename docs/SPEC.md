# Product Specification — DMX MIDI Converter

Version: 0.1 (draft)
Status: requirements draft; decisions that need validation are marked **TBD**.

## 1. Purpose

Convert DMX512 channel values into MIDI events, with user-configurable mappings. The device is intended for stage/production use, including QLab and other MIDI-capable applications.

## 2. Hardware assumptions

- Target MCU: ESP32-S3 family.
- Prototype: ESP32-S3 development board + user's RS-485 receiver module marked MAX3487 (module details must be verified from its schematic/datasheet).
- Prototype DMX receiver is non-isolated. This is for bench testing only.
- DMX receiver RO/RXD is connected to an ESP32 UART RX input. Confirm receiver output voltage compatibility before wiring.
- Target carrier board: Waveshare ESP32-S3-Zero N8R8 (exact revision and pinout to be verified before PCB design).
- DMX connector is external/panel mounted and wired to a board connector.
- USB-C is on the ESP32 module or panel feed-through. USB data path must be preserved for native USB MIDI.
- DMX input: 250 kbit/s, 8 data bits, no parity, 2 stop bits (8N2).
- DMX physical-layer isolation is deferred from MVP; it remains a design consideration for the final product.

## 3. MVP scope

### 3.1 DMX receiver
- Receive DMX frames and extract up to 512 data slots after the start code.
- Maintain latest value for each channel (1–512), values 0–255.
- Report frame freshness and DMX signal state.
- Track frame count and receiver/parser errors where available.
- Provide a configurable signal-loss timeout.
- Default signal-loss timeout: 1000 ms (draft; configurable).
- Treat non-zero start codes as unsupported in MVP; ignore them and do not update the DMX channel state.
- On signal loss: release all active mapped notes. CC values default to hold-last; configurable loss behavior may be added later.

### 3.2 Mapping
- Each mapping has an enable flag, DMX channel, mapping type, MIDI channel, target number, scaling range, inversion, deadband, and output selection.
- MVP mapping types:
  - CC: DMX value scaled to MIDI 0–127.
  - Note: threshold with hysteresis; transition to active emits Note On, transition inactive emits Note Off.
- Note velocity is configurable (default 100); optional velocity-from-DMX may be added later.
- Multiple mappings may reference the same DMX channel.
- A mapping may target one or more enabled MIDI outputs, but MVP has USB only.
- Duplicate mappings are allowed; validate conflicts and warn rather than silently overwrite.
- MIDI channels are stored as 1–16 in the UI and converted to zero-based channel nibble internally.

### 3.3 USB MIDI
- USB MIDI device output using ESP32-S3 native USB.
- Device name/product string: `DMX MIDI Converter` (subject to USB stack constraints).
- Provide status for USB configured/connected, if supported by the stack.
- Emit CC and Note messages.
- Avoid flooding: CC only sends when the mapped value changes beyond configured deadband.
- Note events are edge-triggered; do not repeat Note On per DMX frame.
- On disconnect/reset, clear internal active-note state; on reconnect, do not synthesize Note On unless a fresh DMX transition occurs.

### 3.4 Wi-Fi and Web UI
- MVP supports AP mode for initial setup.
- Default AP SSID: `DMX-MIDI-Setup` (configurable).
- AP password/security policy TBD; choose a secure default or provide a documented setup method. Avoid shipping an open AP in production.
- Web UI served from device.
- UI pages:
  - Dashboard/status
  - DMX monitor (512 channels)
  - Mapping editor
  - Settings
- API is versioned under `/api/v1`.
- WebSocket endpoint `/ws` for live status/DMX updates.
- Configuration writes must be validated and return useful errors.
- UI should remain functional on desktop and mobile browsers.

### 3.5 Configuration and presets
- Configuration stored persistently (NVS or equivalent).
- Include a config schema/version.
- On invalid config: load defaults and report a diagnostic.
- MVP: one active configuration, export/import JSON.
- Presets/slots may be implemented after MVP.

### 3.6 Diagnostics
- Dashboard shows DMX online/offline, last frame age, frame counter, USB MIDI state, Wi-Fi state, firmware version.
- Diagnostic counters: malformed/unsupported frames where detectable, config validation failures, MIDI send failures where APIs expose them.
- No logging from time-critical DMX receive path.

## 4. Mapping definitions

### CC mapping
- DMX 0–255 maps linearly to outputMin–outputMax (0–127 by default).
- Support inputMin/inputMax; values outside range clamp.
- Optional inversion.
- Deadband defines minimum output change before transmitting.
- Send an initial CC when mapping becomes enabled or when USB becomes available? **TBD**. Recommended default: send current mapped value once when USB becomes ready, to synchronize host state.

### Note mapping
- Use two thresholds: `thresholdOn` and `thresholdOff`, where thresholdOn > thresholdOff.
- Inactive -> active: Note On (velocity > 0).
- Active -> inactive: Note Off (or Note On velocity 0).
- Defaults: thresholdOn 20, thresholdOff 10, velocity 100.
- Ensure Note Off is sent on DMX timeout, mapping disable, config replacement, output disconnect handling when possible, and shutdown/restart.

## 5. DMX signal loss

- Signal loss determined by elapsed time since last valid frame.
- Default timeout: 1000 ms (configurable).
- DMX offline event should be emitted once per transition, not repeatedly.
- Release all active notes.
- CC mappings: hold last value in MVP.
- Web UI status reflects offline state and age.

## 6. Web/API contract (draft)

### HTTP
- `GET /api/v1/status` — system and connection status.
- `GET /api/v1/config` — current configuration.
- `PUT /api/v1/config` — replace settings (validated).
- `GET /api/v1/mappings` — list mappings.
- `PUT /api/v1/mappings` — replace mapping list (validated).
- `GET /api/v1/dmx` — snapshot of 512 channel values and metadata.
- `GET /api/v1/diagnostics` — counters and error state.
- `POST /api/v1/config/export` — optional; alternatively export client-side from GET.
- `POST /api/v1/config/import` — validate and apply imported configuration.
- `POST /api/v1/system/reboot` — reboot after explicit confirmation.
- `POST /api/v1/system/ota` — OTA upload; deferred from MVP unless implementation schedule allows.

### WebSocket
- `/ws`
- Event envelopes contain `type`, `timestamp` or monotonic time, and payload.
- Initial events on connection: system status and DMX snapshot (or request/response snapshot).
- Live events:
  - `status`
  - `dmx_delta` (changed channel/value pairs)
  - `midi_activity` (debug view; may be rate-limited)
  - `config_changed`

Example DMX delta:
```json
{
  "type": "dmx_delta",
  "channels": [{"channel": 1, "value": 127}, {"channel": 3, "value": 255}]
}
```

## 7. Configuration JSON draft

```json
{
  "schemaVersion": 1,
  "device": {"name": "DMX MIDI Converter"},
  "dmx": {"lossTimeoutMs": 1000},
  "outputs": {"usb": true, "ble": false, "rtp": false},
  "wifi": {"mode": "ap", "ssid": "DMX-MIDI-Setup"},
  "mappings": [
    {
      "id": "map-1",
      "enabled": true,
      "dmxChannel": 1,
      "type": "cc",
      "midiChannel": 1,
      "midiNumber": 7,
      "inputMin": 0,
      "inputMax": 255,
      "outputMin": 0,
      "outputMax": 127,
      "invert": false,
      "deadband": 1,
      "outputs": ["usb"]
    },
    {
      "id": "map-2",
      "enabled": true,
      "dmxChannel": 2,
      "type": "note",
      "midiChannel": 1,
      "midiNumber": 60,
      "thresholdOn": 20,
      "thresholdOff": 10,
      "velocity": 100,
      "outputs": ["usb"]
    }
  ]
}
```

## 8. Validation rules

- DMX channel: 1–512.
- MIDI channel: 1–16.
- CC number: 0–127.
- Note number: 0–127.
- Note velocity: 1–127.
- CC output range: 0–127, outputMin <= outputMax.
- Input range: 0–255, inputMin <= inputMax.
- Deadband: 0–127.
- Note threshold: 0–255, thresholdOn > thresholdOff.
- Mapping ID unique.
- Output list contains only supported outputs; MVP supports `usb`.
- Invalid changes are rejected atomically; do not partially apply a mapping list.

## 9. Performance and reliability

- DMX receive path must not block on web, storage, or MIDI operations.
- Use a bounded queue or event buffer between DMX processing and MIDI output.
- DMX state updates should be coherent when read by UI/mapping engine.
- WebSocket DMX updates are rate-limited and delta-based.
- Avoid unnecessary flash writes; only persist when user saves or applies configuration.
- Reboot/watchdog recovery should not leave notes logically active; initialize state cleanly.

## 10. Security

- AP setup mode should not expose configuration changes without authentication in production.
- Do not expose Wi-Fi credentials in status endpoints or logs.
- OTA updates must verify image integrity; secure boot/signing can be considered for production.
- Avoid unauthenticated reboot/config endpoints outside setup mode.

## 11. Test plan

### DMX
- Valid frame with 1, 32, 128, and 512 slots.
- Channel values 0, 1, 127, 128, 254, 255.
- BREAK/MAB handling.
- Repeated frames at different rates.
- Unsupported start code.
- Cable disconnect and timeout.
- Noise / malformed frames if test equipment permits.

### Mapping
- CC scaling endpoints and midpoints.
- Clamp and inversion.
- Deadband.
- Note threshold/hysteresis.
- No repeated Note On while held.
- Note Off on timeout and mapping disable.
- Multiple mappings from one DMX channel.

### USB MIDI
- Enumerate on macOS/Windows/Linux.
- Verify CC and Note events with MIDI monitor and QLab.
- USB unplug/replug.
- No stuck notes after reset/disconnect.

### Web
- AP setup and mobile/desktop access.
- DMX monitor correctness.
- Mapping validation.
- Save/reboot/restore.
- Export/import and invalid JSON handling.

## 12. Milestones

1. Hardware bench validation: ESP32 UART + RS-485 receiver.
2. DMX parser and monitor through serial/logging.
3. USB MIDI output.
4. Mapping engine (CC, Note).
5. AP + Web UI and DMX monitor.
6. Persistent config and import/export.
7. BLE MIDI.
8. RTP-MIDI.
9. OTA and production hardening.

## 13. Open decisions

- Exact ESP32-S3 board/revision and pinout.
- Exact RS-485 module circuit, power, receiver logic voltage, termination and bias.
- DMX receiver implementation details: UART driver vs custom BREAK detection.
- USB MIDI stack/component selection.
- Web UI framework/build pipeline and flash partitioning.
- AP security and pairing/setup strategy.
- CC synchronization behavior on USB connect.
- Whether mapping list has a practical UI limit or supports all 512 channels.
- BLE MIDI and RTP-MIDI compatibility matrix.
- Isolation/protection strategy for final hardware.
