# DeepSeek Harness Desktop

[English](README.md) | 中文

Electron 桌面壳以受监督子进程运行现有 `dsh web` 应用，并在加固的 `BrowserWindow` 中显示其 loopback Web UI。桌面应用不会重新实现 Harness 客户端或 API。

桌面发行版的变更历史记录在[版本更新](updates/README.md)中。

## 来源

本桌面发行版由 [Mekey Pan](https://github.com/pmy0721) 借助 Codex 维护。它保留 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 的核心与历史，整合、改编了 [salathleizhang/deepseek-harness-desktop](https://github.com/salathleizhang/deepseek-harness-desktop) 中采用 MIT 许可证的 Electron 实现，并改编了 [`anywhere-labs/deepseek-harness-desktop` 的 `f9aa1b1` 版本](https://github.com/anywhere-labs/deepseek-harness-desktop/tree/f9aa1b1a173e52705aa7e01bb734469a9dd247a8)中的原生窗口、启动诊断与打包运行时检查。它是独立社区项目，不是 DeepSeek 官方产品。

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

打包流程暂存官方 Node.js 运行时，使用 Node.js `SHASUMS256.txt` 校验其完整性，部署构建后的 `@deepseek-ai/dsh` 运行时闭包，再把两者放入 Electron 应用资源。Electron Builder 的 `afterPack` hook 随后会检查随附 Node 可执行文件、dsh CLI 入口和 Web 前端入口；任一缺失都会拒绝该应用。输出位于 `apps/desktop/release/`。

本地安装包不签名。个人自用不需要 Developer ID 或 Apple 公证，但 Gatekeeper 可能要求用户在本机明确批准。公开分发时应加入分发者自己的 Developer ID 身份与公证凭据。无论是否签名，运行时暂存检查、`afterPack` 验证与本地启动冒烟都必须保留，因为签名并不能证明应用内含可运行的 Host。

## 运行行为

桌面壳启动 `dsh web --port 0`，最多等待 90 秒获取标准就绪行，再加载报告的 `127.0.0.1` 源。超时或就绪行格式错误时会终止该 Host，记录诊断及最近 32 KiB 启动输出，并保持原生窗口开启，由有限指数退避启动替代进程。明确退出应用时先发送 `SIGTERM`，等待五秒，必要时升级为 `SIGKILL`。关闭窗口只会隐藏窗口，托盘继续维持 Host 运行。

Web 客户端从 URL 读取桌面平台标记。macOS 使用 90px 折叠轨道避让交通灯；macOS 与 Windows 提供原生标题栏拖拽区，同时将交互控件保持为不可拖拽区，Windows 还会预留标题栏按钮空间；侧边栏使用半透明材质，而会话栏与详情栏保持不透明。打开模态框期间，所有拖拽区都会暂时失效。Linux 保留浏览器布局，以标题栏 inset 取代透明原生窗口处理。

macOS 上的 Host 合并日志位于 `~/Library/Logs/dsh-desktop/harness.log`。`DSH_DESKTOP_PORT` 可固定端口，`DSH_DESKTOP_LOG_DIR` 可修改日志目录，打包运行时不存在时可用 `DSH_DESKTOP_DSH_BIN` 选择开发启动器。

## 安全性

渲染进程启用 `contextIsolation: true`、`nodeIntegration: false` 与 `sandbox: true`，并拒绝 Electron 权限请求。导航被限制在受监督的 loopback 源，HTTP 与 HTTPS 链接交给系统浏览器打开。窗口不安装 preload 桥，Harness 特权操作仍受现有 loopback API 检查保护。

## 已知限制

- 本地 DMG 未签名，不满足 Gatekeeper 分发要求。
- 本地构建不包含 macOS Intel、Windows、自动更新、登录自启和原生通知。
- Electron 不会为模型驱动的子进程增加操作系统代码沙箱；Harness 策略和平台保护仍是安全依据。
