# Desktop version updates

English | [中文](README.zh.md)

This file records desktop-distribution changes. Repository-wide package versions remain governed by the root release process.

## Unreleased — 2026-08-15

- Completed macOS and Windows native-window adaptation across the application frame, sidebar, conversation header, modal drag handling, and workspace fade behavior.
- Added a 90-second Host readiness deadline, bounded recent-output diagnostics, an error page, process termination, and supervised restart.
- Added Electron Builder `afterPack` validation for the bundled Node executable, dsh CLI entry, and Web frontend entry, with macOS and Windows configuration coverage.
- Kept the independent Node 22 runtime after evaluating Electron 43's bundled Node runtime. Electron's Node 24 can load `node-pty`, but the assembled Host also requires `--expose-internals`.
- Preserved unsigned, unnotarized personal builds. Public distribution remains a separate Developer ID signing and notarization workflow.

## 0.1.0-rc.5 — 2026-08-14

- Added the self-contained Electron desktop shell, supervised loopback Web Host, tray-owned lifetime, packaged Node runtime, local macOS DMG configuration, and provenance disclosure.
