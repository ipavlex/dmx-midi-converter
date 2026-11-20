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

```
dmx-midi-converter/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   └── SPEC.md
├── firmware/
│   └── README.md
├── protocol/
│   └── api-schema.json
├── web-ui/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

The `firmware/` tree shown in `docs/ARCHITECTURE.md` (dmx/, mapping/, midi/, network/, config/, system/) is the target layout — firmware implementation has not started yet.