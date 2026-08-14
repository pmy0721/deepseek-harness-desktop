# Agent Note: Electron desktop shell over the supervised Web Host

Status: implemented

English | [中文](2026-08-14-electron-desktop-shell.zh.md)

## Problem

DeepSeek Harness exposes its graphical client through `dsh web`, so desktop use requires a terminal-managed Host and a separate browser window. A distributable desktop application also needs a compatible Node runtime, deterministic Host lifetime, a native application window, and a package that keeps user data outside the application payload.

The [GUI layering decision](../architecture/2026-07-19-gui-layering-and-rpc-protocol.md) reserves an Electron IPC carrier, but the current Web client boot also depends on the Host-composed client-module graph, static bundle routes, readiness semantics, and the HTTP/WebSocket transport. Replacing that complete delivery path is independent from supplying a desktop product.

## Decision

`apps/desktop` is an Electron shell that supervises the built `dsh web` profile as a child process. The child binds a random `127.0.0.1` port, prints its canonical readiness URL after the Loader tree settles, and remains the sole owner of the Web Host, API routes, client-module graph, session storage, and profile data. The Electron renderer loads that origin without modifying the application protocol.

The main process owns one Harness child and one application instance. It captures Host output to a platform log, restarts unexpected exits with bounded exponential backoff, hides ordinary window closes to the tray, and stops the child before explicit application exit. A packaged build runs the deployed `@deepseek-ai/dsh` closure on a bundled Node runtime instead of Electron's internal Node or a `PATH` executable.

The renderer enables context isolation, disables Node integration, enables Electron's renderer sandbox, denies permission requests, and rejects navigation away from the supervised loopback origin. External HTTP and HTTPS links open in the system browser. The window installs no preload bridge and exposes no Harness method or filesystem primitive.

The packaging step downloads the pinned Node distribution from nodejs.org, verifies the archive against that release's `SHASUMS256.txt`, deploys the production CLI dependency closure, materializes workspace links, and fails on any incomplete stage. The private desktop workspace shares the dsh release version and tag but stays outside npm pack and publish operations. The local macOS artifact is unsigned; signing and notarization remain distributor-owned operations.

## Alternatives considered

**Electron IPC as the initial carrier.** Rejected for this delivery. It would also need an Electron arrival path for the Host-composed client-module graph, plugin bundles, downlink streams, and native providers before it could replace the Web Host. The protocol still permits a later IPC transport, but a desktop product does not depend on that transport migration.

**Run the Harness inside Electron's main process.** Rejected because Electron's embedded Node version is coupled to the Electron release and a Host failure would terminate the native window. A supervised child runs on the repository's declared Node range and isolates process failure.

**Tauri or a native Swift client.** Rejected because the Harness remains a Node application and the complete client is already built for Chromium. Tauri would add a Rust and system-WebView compatibility surface while still shipping Node; a native UI would duplicate the client and its behavior.

**Install a browser PWA.** Rejected because it still requires the user to manage `dsh web` and does not own Host startup, restart, logs, or application shutdown.

## Consequences

The desktop app preserves the browser product's tested UI and wire behavior while adding a double-clickable, self-contained macOS package. Host crashes do not close the application, and the package does not depend on the user's Node or pnpm installation.

The app ships both Chromium and Node, so disk and memory use exceed the CLI. Loopback HTTP and WebSocket remain part of the desktop runtime, although the port is random and bound only to `127.0.0.1`. Electron does not add an operating-system sandbox for model-driven subprocesses. Local DMGs require distributor signing and notarization before public release.

The GUI layering note remains active because its package boundaries, protocol model, and IPC extension point still guide future work; this note only replaces its assumption that the first Electron product does not reuse the Web carrier.
