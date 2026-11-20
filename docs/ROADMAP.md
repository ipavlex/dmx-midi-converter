# Roadmap

## MVP 0 — hardware smoke test
- ESP32-S3 development board.
- Verify RS-485 receiver module pinout, power and RO logic level.
- Receive DMX UART frames; expose values over serial.

## MVP 1 — USB MIDI
- USB enumeration.
- CC and Note mapping.
- Note cleanup.
- Basic test with QLab / MIDI monitor.

## MVP 2 — Wi-Fi AP + Web
- Setup AP.
- Dashboard and 512-channel monitor.
- Mapping editor.
- Config persistence.

## MVP 3 — BLE MIDI
- Pairing and transport.
- MIDI output routing.

## MVP 4 — RTP-MIDI
- Wi-Fi STA mode.
- RTP-MIDI session and discovery.
- Compatibility tests.

## MVP 5 — production readiness
- OTA.
- Diagnostics.
- Hardware isolation/protection review.
- Long-duration and reconnect testing.
