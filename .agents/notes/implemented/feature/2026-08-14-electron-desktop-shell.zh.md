# Agent Note: 基于受监督 Web Host 的 Electron 桌面壳

Status: implemented

[English](2026-08-14-electron-desktop-shell.md) | 中文

## Problem

DeepSeek Harness 通过 `dsh web` 提供图形客户端，因此桌面使用需要终端管理的 Host 和独立浏览器窗口。可分发的桌面应用还需要兼容的 Node 运行时、确定的 Host 生命周期、原生应用窗口，以及将用户数据保留在应用载荷之外的安装包。

[Web 传输分层决定](../architecture/2026-07-24-web-config-tree-boot-and-transport-layering.zh.md)将浏览器载体与 API gateway、动态加载的客户端图分离。当前 Web 客户端启动仍依赖 Host 组合的该图、静态 bundle 路由、就绪语义以及 HTTP/WebSocket 传输。替换这条完整交付路径，与提供桌面产品是两个独立目标。

## Decision

`apps/desktop` 是一个 Electron 桌面壳，以子进程方式监督构建后的 `dsh web --no-open` profile。子进程绑定随机 `127.0.0.1` 端口，在 Loader 树完成结算后打印带 token 鉴权的就绪 URL，并继续独占 Web Host、API 路由、客户端模块图、会话存储与 profile 数据。`--no-open` 会关闭 CLI 的本机启动浏览器交接，因为产品窗口由 Electron 管理。Electron 渲染进程加载完整就绪 URL，使 Host 能把一次性 token 换成 HttpOnly 浏览器 cookie；导航仍被限制在该 URL 的 loopback 源。

主进程拥有一个 Harness 子进程和一个应用实例。它把 Host 输出记录到平台日志，以有限指数退避重启异常退出的 Host，普通关闭窗口时将窗口隐藏到托盘，并在明确退出应用前停止子进程。每个子进程最多有 90 秒输出标准就绪行；超时或格式错误时，主进程会记录最近 32 KiB 启动输出，以与关闭时相同的有限升级机制终止该子进程，向窗口指出诊断日志位置，再由 supervisor 启动替代进程。打包版本在随附 Node 运行时上执行部署后的 `@deepseek-ai/dsh` 闭包，不依赖 Electron 内置 Node 或 `PATH` 中的可执行文件。

Web 客户端消费桌面平台标记，但不会因此获得 Electron 权限。该标记位于 URL fragment 中，因此可跨越 token 交换重定向保留且不会进入 HTTP 请求。macOS 与 Windows 使用明确的标题栏拖拽 seat，交互后代保持不可拖拽；模态状态会禁用所有拖拽 seat。额外的空白页拖拽条仅在没有 Session 页头时挂载，避免 Web 页头没有层叠上下文时拦截控件交互。macOS 使用 90px 折叠侧边栏轨道避让交通灯，Windows 在会话页头预留原生标题栏按钮区域。原生 vibrancy 或 acrylic 只从半透明侧边栏透出；会话栏与详情栏保持不透明，Linux 则在标题栏 inset 下继续使用普通浏览器表面。

渲染进程启用上下文隔离，关闭 Node 集成，启用 Electron 渲染沙箱，拒绝权限请求，并阻止离开受监督 loopback 源的导航。外部 HTTP 与 HTTPS 链接交给系统浏览器打开。窗口不安装 preload 桥，也不暴露 Harness 方法或文件系统原语。

打包步骤从 nodejs.org 下载固定版本的 Node 发行包，依据对应版本的 `SHASUMS256.txt` 校验归档，部署生产 CLI 依赖闭包，实体化工作区链接，并在任一阶段不完整时失败。组装后 Web profile 导入的软件包保持为 CLI 直接依赖，因为旧版 deploy 无法推导恢复被提升工作区包时省略的依赖，也无法从 Loader 配置满足 capability peer。`afterPack` hook 会在生成安装包前，再从完成的应用资源中独立检查目标 Node 可执行文件、部署后的 dsh CLI 入口和 Web 前端入口，并用该 Node 二进制执行 `dsh --version`。私有桌面 workspace 将 Electron 入口直接输出到 `apps/desktop/lib`；仓库清理器会同时移除这份应用自有输出及其增量构建状态，确保后续打包命令必须生成完整入口。该 workspace 共享 dsh 发布版本与 tag，但不进入 npm pack 和 publish 操作。个人产物保持未签名、未公证；公开分发者负责 Developer ID 签名与公证。

## Alternatives considered

**把 Electron IPC 作为初始载体。** 本次交付不采用。它还需要为 Host 组合的客户端模块图、插件 bundle、下行流和原生 provider 实现 Electron 到达路径，才能取代 Web Host。协议仍允许后续增加 IPC 传输，但桌面产品不依赖这次传输迁移。

**在 Electron 主进程内运行 Harness。** 否决。Electron 内置 Node 版本与 Electron 发行版耦合，而且 Host 故障会终止原生窗口。受监督子进程使用仓库声明的 Node 版本范围，并隔离进程故障。

**通过 Electron 的 Node 模式运行受监督子进程。** 当前安装包不采用。Electron 43 内置的 Node 24.18.1 能加载已暂存的 `node-pty` 预构建，也能启动 Web Host，但完整组装的 Host 需要额外传入 `--expose-internals`，随附的 Node 22 运行时则可直接启动。移除独立运行时可从 Apple Silicon 暂存树中节省约 124 MiB，但每次 Electron 升级也会同时负责 CLI Node 版本、ABI、可接受的 Node 参数与原生依赖兼容性。独立运行时使两组发布决定保持分离。

**使用 Tauri 或原生 Swift 客户端。** 否决。Harness 仍是 Node 应用，完整客户端已经针对 Chromium 构建。Tauri 会增加 Rust 与系统 WebView 兼容面，同时仍需分发 Node；原生 UI 则会重复实现客户端及其行为。

**安装浏览器 PWA。** 否决。用户仍需管理 `dsh web`，而且 PWA 不拥有 Host 启动、重启、日志或应用关闭过程。

## Consequences

桌面应用保留浏览器产品经过测试的 UI 与线上行为，同时增加可双击、自包含的 macOS 安装包。Host 崩溃不会关闭应用，安装包也不依赖用户安装 Node 或 pnpm。

应用同时分发 Chromium 与 Node，因此磁盘与内存占用高于 CLI。loopback HTTP 与 WebSocket 仍属于桌面运行时，但端口随机且仅绑定 `127.0.0.1`。Electron 不会为模型驱动的子进程增加操作系统沙箱。未签名 DMG 经本机明确批准后可供个人使用；公开发布需要由分发者签名并公证。签名不能替代运行时完整性检查或启动冒烟。

Web 传输分层记录仍是桌面壳所复用载体、鉴权、gateway 与客户端图的权威说明。本记录只负责 Web 应用外围的 Electron 进程、窗口、打包与呈现集成。
