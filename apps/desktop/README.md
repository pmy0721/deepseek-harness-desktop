# DeepSeek Harness Desktop

English | [中文](README.zh.md)

The Electron shell starts the existing `dsh web` application as a supervised child process and displays its loopback Web UI in a hardened `BrowserWindow`. The desktop app does not reimplement the Harness client or API.

## Provenance

This desktop distribution is maintained by [Mekey Pan](https://github.com/pmy0721) with Codex. It preserves the core and history of [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness), and incorporates and adapts the MIT-licensed Electron implementation from [salathleizhang/deepseek-harness-desktop](https://github.com/salathleizhang/deepseek-harness-desktop). It is an independent community project, not an official DeepSeek product.

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

The package stages an official Node.js runtime, verifies it against Node.js `SHASUMS256.txt`, deploys the built `@deepseek-ai/dsh` runtime closure, and places both under the Electron app's resources. The output is written to `apps/desktop/release/`.

Local packages are unsigned. Distributors must configure their own Developer ID identity and notarization credentials before publishing a DMG.

## Runtime behavior

The shell starts `dsh web --port 0`, waits for the canonical readiness line, then loads the reported `127.0.0.1` origin. Unexpected Host exits restart with bounded exponential backoff. Explicit application quit sends `SIGTERM`, waits five seconds, and escalates to `SIGKILL` when necessary. Closing the window hides it while the tray keeps the Host alive.

The combined Host log is stored at `~/Library/Logs/dsh-desktop/harness.log` on macOS. `DSH_DESKTOP_PORT` pins a port, `DSH_DESKTOP_LOG_DIR` changes the log directory, and `DSH_DESKTOP_DSH_BIN` selects a development launcher when the packaged runtime is absent.

## Security

The renderer uses `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, and denies Electron permission requests. Navigation stays on the supervised loopback origin; HTTP and HTTPS links open in the system browser. The window has no preload bridge, while privileged Harness operations remain behind the existing loopback API checks.

## Limitations

- The local DMG is unsigned and will not satisfy Gatekeeper distribution requirements.
- macOS Intel, Windows, auto-update, launch at login, and native notifications are not part of this local build.
- Electron does not add an operating-system code sandbox for model-driven subprocesses; the Harness policy and platform protections remain authoritative.
