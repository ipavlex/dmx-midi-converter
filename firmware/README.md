# Firmware scaffold

Firmware implementation is not included yet. Target is ESP-IDF C++ for ESP32-S3.

Suggested component boundaries:
- dmx_receiver
- mapping_engine
- midi_event_bus
- usb_midi
- config_manager
- wifi_manager
- http_api
- websocket_hub
- diagnostics

Do not start implementation until board revision, RS-485 module logic voltage, and chosen USB MIDI stack are verified.
