# DeepSeek Harness

English | [中文](README.zh.md)

DeepSeek Harness (`dsh`) is an open-source agent harness developed by [DeepSeek AI](https://deepseek.com).

It uses an architecture where **everything is a plugin**, and is powered by [Cordis](https://github.com/cordiverse/cordis), whose design is described in [_A Programming Paradigm for Spatiotemporal Composability_](https://github.com/cordiverse/paper).

## Desktop distribution

This repository adds a community-maintained desktop application to the upstream DeepSeek Harness source. It is not an official DeepSeek product. See the [desktop application documentation](apps/desktop/README.md) for its build, runtime, security, limitations, and source provenance.

### Desktop version updates

Repository-wide package versions remain governed by the root release process.

#### Unreleased — 2026-08-15

- Completed macOS and Windows native-window adaptation across the application frame, sidebar, conversation header, modal drag handling, and workspace fade behavior.
- Added a 90-second Host readiness deadline, bounded recent-output diagnostics, an error page, process termination, and supervised restart.
- Added Electron Builder `afterPack` validation for the bundled Node executable, dsh CLI entry, and Web frontend entry, with macOS and Windows configuration coverage.
- Kept the independent Node 22 runtime after evaluating Electron 43's bundled Node runtime. Electron's Node 24 can load `node-pty`, but the assembled Host also requires `--expose-internals`.
- Preserved unsigned, unnotarized personal builds. Public distribution remains a separate Developer ID signing and notarization workflow.

#### 0.1.0-rc.5 — 2026-08-14

- Added the self-contained Electron desktop shell, supervised loopback Web Host, tray-owned lifetime, packaged Node runtime, local macOS DMG configuration, and provenance disclosure.

## Developer preview

DeepSeek Harness is currently in _developer preview_ and is iterating rapidly. **THERE WILL BE COMPATIBILITY-BREAKING CHANGES.**

## Run

### Run from `npm`

Install `Node.js`, then run:

```sh
npx @deepseek-ai/dsh web
```

The command starts the Web UI, served at `http://127.0.0.1:3080` by default. See [Web UI guide](docs/user/guide/index.md).

### Run from source

To run from a repository checkout:

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

## Community and support

- Feel free to submit feedback or bug reports through [GitHub Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions).
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
