# DeepSeek Harness

English | [中文](README.zh.md)

DeepSeek Harness (`dsh`) is an open-source agent harness developed by [DeepSeek AI](https://deepseek.com).

It is built on an **everything-is-a-plugin** architecture and powered by [Cordis](https://github.com/cordiverse/cordis), whose design is described in [_A Programming Paradigm for Spatiotemporal Composability_](https://arxiv.org/abs/2608.25512).

Documentation: [https://deepseek-harness.github.io/deepseek-harness/](https://deepseek-harness.github.io/deepseek-harness/)

## Desktop distribution

This repository adds a community-maintained desktop application to the upstream DeepSeek Harness source. It is not an official DeepSeek product. See the [desktop application documentation](apps/desktop/README.md) for its build, runtime, security, limitations, and source provenance.

### Desktop version updates

Repository-wide package versions remain governed by the root release process. Dated desktop development logs are retained separately from releases.

#### 0.1.3-alpha.1 — 2026-09-05

- Integrated the official `dsh-v0.1.3-alpha.1` baseline with the supervised Desktop Host, hardened window, tray lifecycle, native sidebar, and packaged runtime.
- Added general file uploads, image tool cards, Skill fuzzy search, environment proxy support, and expanded model discovery.
- Included goal-pause cancellation, streaming tool-call, session search, and cache fixes, plus bidirectional subagent messaging.
- Adopted Session format v2 with immutable generation migration, lifecycle-owned handles, and process locks. Upstream reports a known slowdown when loading some historical sessions.

#### 0.1.2-alpha.1 — 2026-08-29

- Integrated the official `dsh-v0.1.2-alpha.1` source baseline while retaining the supervised Desktop Host, hardened Electron window, tray lifecycle, and packaged runtime.
- Added conversation process folding, exact token usage, compact turn navigation, adaptive content width, font sizing, improved image handling, and queued prompts during active turns.
- Added configurable subagent models and reasoning effort, broader ACP support, provider sign-in surfaces, third-party UI languages, and the official DeepSeek plugin inventory and optional Session-log upload integrations.
- Adopted token-authenticated Web startup, profile-owned application launch, the `@Remote` gateway, PTC mode naming, WebSocket keepalives, and the upstream shell, preset, session, and WebFetch fixes.

#### 0.1.1-rc.2 — 2026-08-22

- Integrated the official `dsh-v0.1.1-rc.2` source baseline while retaining the supervised desktop Host, hardened Electron window, tray lifecycle, and packaged runtime.
- Added the `DeepSeek-V4-Flash-Vision-Exp` model, Files API image upload reuse, and model-aware image resizing and format conversion.
- Included the Bubblewrap `/proc/<pid>/root` confinement fix and upstream session projection, credential authorization, and static Web delivery improvements.
- Adopted multiline question answers plus the upstream composer-reference, Markdown-table, cache-hit display, and subagent-navigation fixes.

#### 0.1.0-rc.8 — 2026-08-21

- Integrated the official `dsh-v0.1.0-rc.8` source baseline while retaining the supervised desktop Host, hardened Electron window, tray lifecycle, and packaged runtime.
- Added native DeepSeek image requests, command image input, file and session references, installable Claude Code and Codex subagents, persistent PowerShell terminals, concurrent Web searches, and the upstream UI and session-performance fixes.
- Disabled the CLI's default-browser handoff for the supervised Host because Electron owns the product window.
- Adopted SQLite schema 17 for opt-in SQLite deployments. Existing schema versions remain incompatible and require a new database; the shipped Web profile continues to use JSONL persistence.

#### 0.1.0-rc.7 — 2026-08-18

- Integrated the official `dsh-v0.1.0-rc.7` source baseline while retaining the supervised desktop Host, hardened Electron window, tray lifecycle, and packaged runtime.
- Added the official plugin-owned settings surface, collapsible question composer, one-shot background subagents, large-history pagination fix, Safari textarea reflow fix, terminal fixes, and DeepSeek token-limit alignment.

#### Daily development log — 2026-08-15

- Completed macOS and Windows native-window adaptation across the application frame, sidebar, conversation header, modal drag handling, and workspace fade behavior.
- Added a 90-second Host readiness deadline, bounded recent-output diagnostics, an error page, process termination, and supervised restart.
- Added Electron Builder `afterPack` validation for the bundled Node executable, dsh CLI entry, and Web frontend entry, with macOS and Windows configuration coverage.
- Kept the independent Node 22 runtime after evaluating Electron 43's bundled Node runtime. Electron's Node 24 can load `node-pty`, but the assembled Host also requires `--expose-internals`.
- Preserved unsigned, unnotarized personal builds. Public distribution remains a separate Developer ID signing and notarization workflow.

#### 0.1.0-rc.5 — 2026-08-14

- Added the self-contained Electron desktop shell, supervised loopback Web Host, tray-owned lifetime, packaged Node runtime, local macOS DMG configuration, and provenance disclosure.

## Developer preview

DeepSeek Harness is in _developer preview_ and iterating rapidly. **THERE WILL BE COMPATIBILITY-BREAKING CHANGES.**

Review the [safety notice](SAFETY.md) before running the project.

## Run

### Run from `npm`

Install `Node.js`, then run:

```sh
npx @deepseek-ai/dsh web
```

The command starts the Web UI at `http://127.0.0.1:3080` by default and opens it in the default browser for a local launch. An SSH launch only prints the host URL because the SSH client or editor owns the local forwarded address. Pass `--no-open` to run the server without opening a browser. See [Web UI guide](docs/user/guide/index.md).

### Run from source

To run from a repository checkout:

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

`pnpm run build` prepares the repository artifacts. `pnpm dsh web` uses those built artifacts without rebuilding.

## Community and support

- Submit feedback or bug reports through [GitHub Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions).
- Add the [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic to your plugin repository for discoverability.
- Join <a href="https://discord.gg/Ycq5dCaS4">DeepSeek Harness Discord community</a>.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Development

Start with the [development guide](docs/development.md) and [architecture documentation](docs/architecture.md).

For agents, follow [AGENTS.md](AGENTS.md).

## License

[MIT](LICENSE)

Third-party dependencies and their licenses are disclosed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
