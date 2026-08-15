# DeepSeek Harness Desktop

English | [中文](README.zh.md)

The Electron shell starts the existing `dsh web` application as a supervised child process and displays its loopback Web UI in a hardened `BrowserWindow`. The desktop app does not reimplement the Harness client or API.

## Provenance

This desktop distribution is maintained by [Mekey Pan](https://github.com/pmy0721) with Codex. It preserves the core and history of [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness), incorporates and adapts the MIT-licensed Electron implementation from [salathleizhang/deepseek-harness-desktop](https://github.com/salathleizhang/deepseek-harness-desktop), and adapts the native-window, startup-diagnostic, and packaged-runtime verification work from [`anywhere-labs/deepseek-harness-desktop` at `f9aa1b1`](https://github.com/anywhere-labs/deepseek-harness-desktop/tree/f9aa1b1a173e52705aa7e01bb734469a9dd247a8). It is an independent community project, not an official DeepSeek product.

## Development

Build the repository and start the shell from the repository root:

```sh
pnpm run build
pnpm run build:desktop
pnpm --filter @deepseek-ai/dsh-desktop start
```

`pnpm run dev:desktop` watches the desktop TypeScript sources and restarts Electron after each successful emit. Web UI changes still require the normal Web build or watch workflow.

## macOS package

Create a self-contained Apple Silicon DMG:

```sh
pnpm run build
pnpm --filter @deepseek-ai/dsh-desktop run dist:mac
```

The package stages an official Node.js runtime, verifies it against Node.js `SHASUMS256.txt`, deploys the built `@deepseek-ai/dsh` runtime closure, and places both under the Electron app's resources. Electron Builder's `afterPack` hook then rejects the application when the bundled Node executable, dsh CLI entry, or Web frontend entry is absent. The output is written to `apps/desktop/release/`.

Local packages are unsigned. Personal use does not require a Developer ID or Apple notarization, although Gatekeeper may require an explicit local approval. Public distribution should add the distributor's Developer ID identity and notarization credentials. Runtime staging checks, `afterPack` verification, and a local launch smoke remain required in either case because signing does not prove that the application contains a runnable Host.

## Runtime behavior

The shell starts `dsh web --port 0`, waits up to 90 seconds for the canonical readiness line, then loads the reported `127.0.0.1` origin. A timeout or malformed readiness line terminates that Host, records the diagnostic and the latest 32 KiB of startup output, and leaves the native window open while bounded exponential backoff starts a replacement. Explicit application quit sends `SIGTERM`, waits five seconds, and escalates to `SIGKILL` when necessary. Closing the window hides it while the tray keeps the Host alive.

The Web client reads the desktop platform marker from its URL. macOS uses a 90px collapsed rail that clears the traffic lights; macOS and Windows expose native title-bar drag regions while keeping interactive controls non-draggable, reserve Windows caption-button space, and make the sidebar translucent without making the conversation or details surface transparent. Opening a modal disables every drag region until the modal closes. Linux retains the browser layout with a title-bar inset instead of the transparent native-window treatment.

The combined Host log is stored at `~/Library/Logs/dsh-desktop/harness.log` on macOS. `DSH_DESKTOP_PORT` pins a port, `DSH_DESKTOP_LOG_DIR` changes the log directory, and `DSH_DESKTOP_DSH_BIN` selects a development launcher when the packaged runtime is absent.

## Security

The renderer uses `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, and denies Electron permission requests. Navigation stays on the supervised loopback origin; HTTP and HTTPS links open in the system browser. The window has no preload bridge, while privileged Harness operations remain behind the existing loopback API checks.

## Limitations

- The local DMG is unsigned and will not satisfy Gatekeeper distribution requirements.
- macOS Intel, Windows, auto-update, launch at login, and native notifications are not part of this local build.
- Electron does not add an operating-system code sandbox for model-driven subprocesses; the Harness policy and platform protections remain authoritative.
