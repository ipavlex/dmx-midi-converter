# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`.

- **MAJOR** — breaking changes (protocol/API changes, incompatible firmware/UI versions)
- **MINOR** — new features, backwards-compatible
- **PATCH** — bug fixes, docs, formatting

## [0.1.1] - 2026-11-21

### Fixed
- web-ui: broken build — restored missing closing parens in two `.map(...)` calls in `src/App.tsx` (TS1005)
- web-ui: implicit `any` in `Table` callbacks `onToggle`/`onDelete` (TS7006)
- README: project structure tree now renders correctly (wrapped in code block) and reflects the actual repository layout

### Changed
- web-ui: all sources formatted with Prettier according to `.editorconfig` (tabs, LF, final newline; JSON — 2 spaces); Prettier added to devDependencies

## [0.1.0] - 2026-11-21

### Added
- Initial repository scaffold
- `docs/`: SPEC, ARCHITECTURE, ROADMAP
- `protocol/api-schema.json`: device web API schema
- `firmware/`: README stub (implementation not started)
- `web-ui/`: React + Vite demo UI (overview, DMX monitor, mapping, connections, settings) with simulated DMX data
