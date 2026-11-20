# Architecture

## Runtime components

- `DmxReceiver`: UART hardware, frame/BREAK detection, start-code filtering, frame publication.
- `DmxState`: coherent 512-channel snapshot, last-valid-frame timestamp, online state.
- `MappingEngine`: evaluates mappings on channel changes; transforms values; maintains note-active state.
- `MidiEventBus`: internal normalized MIDI events with destination bitmask.
- `UsbMidiOutput`: USB MIDI transport (MVP).
- `BleMidiOutput`: BLE MIDI transport (later).
- `RtpMidiOutput`: RTP-MIDI transport (later).
- `ConfigManager`: schema validation, persistence, atomic apply.
- `WifiManager`: AP/STA policy.
- `HttpApi`: REST handlers.
- `WebSocketHub`: status and DMX delta stream.
- `Diagnostics`: counters and last-error records.

## Data flow

DMX UART -> frame parser -> state snapshot -> channel-change notification -> MappingEngine -> MIDI event queue -> output transport(s).

Web UI reads snapshots through API and subscribes to WebSocket deltas. UI/API must not access UART or mapping internals directly.

## Concurrency

Suggested tasks/contexts:
- DMX UART task/driver callback: receive and publish frames only; do not block.
- Mapping task: consume channel/frame updates and produce MIDI events.
- MIDI output task(s): send queued events.
- Web/API task: handle requests, serialize snapshots, apply validated config.
- Config persistence: write outside real-time paths.

Use a mutex or double-buffered snapshot for DMX values. Queue sizes and task priorities must be measured and tuned; do not assume final numbers before prototype profiling.

## Normalized MIDI event

```cpp
enum class MidiType { NoteOff, NoteOn, ControlChange, ProgramChange, PitchBend };

struct MidiEvent {
  MidiType type;
  uint8_t channel; // internal 0..15
  uint8_t data1;
  uint16_t data2;
  uint8_t destinations;
};
```

## Mapping state

Each mapping keeps:
- last input value
- last output value (for deadband)
- note active state
- initialized/synchronization state

On config replacement, first release all active notes using old config, then validate/apply new config atomically, then reset mapping state.
