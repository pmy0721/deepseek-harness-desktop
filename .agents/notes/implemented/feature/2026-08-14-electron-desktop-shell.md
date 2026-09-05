# Agent Note: Electron desktop shell over the supervised Web Host

Status: implemented

English | [中文](2026-08-14-electron-desktop-shell.zh.md)

## Problem

DeepSeek Harness exposes its graphical client through `dsh web`, so desktop use requires a terminal-managed Host and a separate browser window. A distributable desktop application also needs a compatible Node runtime, deterministic Host lifetime, a native application window, and a package that keeps user data outside the application payload.

The [Web transport layering decision](../architecture/2026-07-24-web-config-tree-boot-and-transport-layering.md) separates the browser carrier from the API gateway and dynamically loaded client graph. The current Web client boot depends on that Host-composed graph, static bundle routes, readiness semantics, and HTTP/WebSocket transport. Replacing that complete delivery path is independent from supplying a desktop product.

## Decision

`apps/desktop` is an Electron shell that supervises the built `dsh web --no-open` profile as a child process. The child binds a random `127.0.0.1` port, prints its token-authenticated readiness URL after the Loader tree settles, and remains the sole owner of the Web Host, API routes, client-module graph, session storage, and profile data. `--no-open` prevents the CLI's local-launch browser handoff because Electron owns the product window. The Electron renderer loads the complete readiness URL so the Host can exchange its one-time token for an HttpOnly browser cookie. Navigation remains restricted to that URL's loopback origin.

The main process owns one Harness child and one application instance. It captures Host output to a platform log, restarts unexpected exits with bounded exponential backoff, hides ordinary window closes to the tray, and stops the child before explicit application exit. Each child has 90 seconds to emit the canonical readiness line. A timeout or invalid line records the latest 32 KiB of startup output, terminates that child with the same bounded escalation used at shutdown, tells the window where the diagnostic log lives, and lets the supervisor start a replacement. A packaged build runs the deployed `@deepseek-ai/dsh` closure on a bundled Node runtime instead of Electron's internal Node or a `PATH` executable.

The Web client consumes the desktop platform marker without acquiring Electron privileges. The marker rides in the URL fragment, so it survives the token-exchange redirect without entering an HTTP request. macOS and Windows expose explicit title-bar drag seats with non-draggable interactive descendants; modal state disables every drag seat. The extra blank-page drag strip mounts only without a Session header, so it cannot intercept header controls when the Web header has no stacking context. macOS uses a 90px collapsed sidebar rail to clear the traffic lights. Windows reserves its native caption buttons in the conversation header. Native vibrancy or acrylic shows only through the translucent sidebar; conversation and details surfaces remain opaque, and Linux retains the ordinary browser surfaces below its title-bar inset.

The renderer enables context isolation, disables Node integration, enables Electron's renderer sandbox, denies permission requests, and rejects navigation away from the supervised loopback origin. External HTTP and HTTPS links open in the system browser. The window installs no preload bridge and exposes no Harness method or filesystem primitive.

The packaging step downloads the pinned Node distribution from nodejs.org, verifies the archive against that release's `SHASUMS256.txt`, deploys the production CLI dependency closure, materializes workspace links, and fails on any incomplete stage. Packages imported by the assembled Web profile remain direct CLI dependencies because the legacy deploy cannot derive dependencies omitted while restoring hoisted workspace packages or satisfy capability peers from Loader configuration. An `afterPack` hook independently verifies the target Node executable, deployed dsh CLI entry, and Web frontend entry inside the completed application resources, then executes `dsh --version` with that Node binary before an installer can be created. The private desktop workspace emits its Electron entry directly into `apps/desktop/lib`; the repository cleaner removes that application-owned output together with its incremental build state so a subsequent package command must emit a complete entry. The workspace shares the dsh release version and tag while staying outside npm pack and publish operations. Personal artifacts remain unsigned and unnotarized; public distributors own Developer ID signing and notarization.

## Alternatives considered

**Electron IPC as the initial carrier.** Rejected for this delivery. It would also need an Electron arrival path for the Host-composed client-module graph, plugin bundles, downlink streams, and native providers before it could replace the Web Host. The protocol still permits a later IPC transport, but a desktop product does not depend on that transport migration.

**Run the Harness inside Electron's main process.** Rejected because Electron's embedded Node version is coupled to the Electron release and a Host failure would terminate the native window. A supervised child runs on the repository's declared Node range and isolates process failure.

**Run the supervised child through Electron's Node mode.** Rejected for the current package. Electron 43's Node 24.18.1 can load the staged `node-pty` prebuild and can start the Web Host, but the assembled Host requires the additional `--expose-internals` flag while the bundled Node 22 runtime starts it directly. Removing the separate runtime would save about 124 MiB from the Apple Silicon staging tree, but it would also make each Electron upgrade responsible for the CLI Node version, ABI, accepted Node flags, and native dependency compatibility. The independent runtime keeps those release decisions separate.

**Tauri or a native Swift client.** Rejected because the Harness remains a Node application and the complete client is already built for Chromium. Tauri would add a Rust and system-WebView compatibility surface while still shipping Node; a native UI would duplicate the client and its behavior.

**Install a browser PWA.** Rejected because it still requires the user to manage `dsh web` and does not own Host startup, restart, logs, or application shutdown.

## Consequences

The desktop app preserves the browser product's tested UI and wire behavior while adding a double-clickable, self-contained macOS package. Host crashes do not close the application, and the package does not depend on the user's Node or pnpm installation.

The app ships both Chromium and Node, so disk and memory use exceed the CLI. Loopback HTTP and WebSocket remain part of the desktop runtime, although the port is random and bound only to `127.0.0.1`. Electron does not add an operating-system sandbox for model-driven subprocesses. An unsigned DMG is suitable for personal use after explicit local approval; public release requires distributor signing and notarization. Signing does not replace runtime integrity checks or launch smoke tests.

The Web transport layering note remains authoritative for the carrier, authentication, gateway, and client graph that the desktop shell reuses. This note owns only the Electron process, window, packaging, and presentation integration around that Web application.
