# DeepSeek Harness Desktop

[English](README.md) | 中文

Electron 桌面壳以受监督子进程运行现有 `dsh web` 应用，并在加固的 `BrowserWindow` 中显示其 loopback Web UI。桌面应用不会重新实现 Harness 客户端或 API。

## 来源

本桌面发行版由 [Mekey Pan](https://github.com/pmy0721) 借助 Codex 维护。它保留 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 的核心与历史，并整合、改编了 [salathleizhang/deepseek-harness-desktop](https://github.com/salathleizhang/deepseek-harness-desktop) 中采用 MIT 许可证的 Electron 实现。它是独立社区项目，不是 DeepSeek 官方产品。

## 开发运行

在仓库根目录构建并启动桌面壳：

```sh
pnpm run build
pnpm run build:desktop
pnpm --filter @deepseek-ai/dsh-desktop start
```

`pnpm run dev:desktop` 监视桌面端 TypeScript 源码，并在每次成功生成后重启 Electron。Web UI 改动仍使用原有 Web 构建或监视流程。

## macOS 安装包

创建自包含的 Apple Silicon DMG：

```sh
pnpm run build
pnpm --filter @deepseek-ai/dsh-desktop run dist:mac
```

打包流程暂存官方 Node.js 运行时，使用 Node.js `SHASUMS256.txt` 校验其完整性，部署构建后的 `@deepseek-ai/dsh` 运行时闭包，再把两者放入 Electron 应用资源。输出位于 `apps/desktop/release/`。

本地安装包不签名。发布者必须在分发 DMG 前配置自己的 Developer ID 身份与公证凭据。

## 运行行为

桌面壳启动 `dsh web --port 0`，等待标准就绪行，再加载报告的 `127.0.0.1` 源。Host 异常退出后会按有限指数退避重启。明确退出应用时先发送 `SIGTERM`，等待五秒，必要时升级为 `SIGKILL`。关闭窗口只会隐藏窗口，托盘继续维持 Host 运行。

macOS 上的 Host 合并日志位于 `~/Library/Logs/dsh-desktop/harness.log`。`DSH_DESKTOP_PORT` 可固定端口，`DSH_DESKTOP_LOG_DIR` 可修改日志目录，打包运行时不存在时可用 `DSH_DESKTOP_DSH_BIN` 选择开发启动器。

## 安全性

渲染进程启用 `contextIsolation: true`、`nodeIntegration: false` 与 `sandbox: true`，并拒绝 Electron 权限请求。导航被限制在受监督的 loopback 源，HTTP 与 HTTPS 链接交给系统浏览器打开。窗口不安装 preload 桥，Harness 特权操作仍受现有 loopback API 检查保护。

## 已知限制

- 本地 DMG 未签名，不满足 Gatekeeper 分发要求。
- 本地构建不包含 macOS Intel、Windows、自动更新、登录自启和原生通知。
- Electron 不会为模型驱动的子进程增加操作系统代码沙箱；Harness 策略和平台保护仍是安全依据。
