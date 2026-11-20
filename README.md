# DMX MIDI Converter

Universal DMX512-to-MIDI converter based on ESP32-S3.

## MVP
- DMX512 receive (512 slots, 250 kbit/s, 8N2)
- USB MIDI output
- DMX monitor
- Mapping: DMX -> MIDI CC and Note On/Off
- Wi-Fi Access Point + web configuration
- Configuration persistence
- DMX-loss handling (release active notes)

## Status
This repository is a software architecture/specification scaffold. Firmware implementation and hardware validation have not started.

See `docs/SPEC.md` for requirements and `docs/ARCHITECTURE.md` for design.


## Structure
dmx-midi-converter/
│
├── firmware/
│   ├── main/
│   │   └── app_main.cpp
│   │
│   ├── dmx/
│   │   ├── dmx_receiver.cpp
│   │   ├── dmx_parser.cpp
│   │   └── dmx_state.cpp
│   │
│   ├── mapping/
│   │   ├── mapping_engine.cpp
│   │   ├── mapping_config.cpp
│   │   └── value_transform.cpp
│   │
│   ├── midi/
│   │   ├── midi_event.cpp
│   │   ├── midi_router.cpp
│   │   ├── usb_midi.cpp
│   │   ├── ble_midi.cpp
│   │   └── rtp_midi.cpp
│   │
│   ├── network/
│   │   ├── wifi_manager.cpp
│   │   ├── web_server.cpp
│   │   └── rtp_session.cpp
│   │
│   ├── config/
│   │   ├── config_manager.cpp
│   │   └── presets.cpp
│   │
│   ├── system/
│   │   ├── ota.cpp
│   │   ├── diagnostics.cpp
│   │   └── system_status.cpp
│   │
│   └── components/
│
├── web-ui/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── api/
│
├── protocol/
│   └── api-schema.json
│
└── docs/