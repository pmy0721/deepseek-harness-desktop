# Agent Note: 基于受监督 Web Host 的 Electron 桌面壳

Status: implemented

[English](2026-08-14-electron-desktop-shell.md) | 中文

## Problem

DeepSeek Harness 通过 `dsh web` 提供图形客户端，因此桌面使用需要终端管理的 Host 和独立浏览器窗口。可分发的桌面应用还需要兼容的 Node 运行时、确定的 Host 生命周期、原生应用窗口，以及将用户数据保留在应用载荷之外的安装包。

[GUI 分层决定](../architecture/2026-07-19-gui-layering-and-rpc-protocol.md)为 Electron IPC 载体预留了位置，但当前 Web 客户端启动还依赖 Host 组合的客户端模块图、静态 bundle 路由、就绪语义以及 HTTP/WebSocket 传输。替换这条完整交付路径，与提供桌面产品是两个独立目标。

## Decision

`apps/desktop` 是一个 Electron 桌面壳，以子进程方式监督构建后的 `dsh web` profile。子进程绑定随机 `127.0.0.1` 端口，在 Loader 树完成结算后打印标准就绪 URL，并继续独占 Web Host、API 路由、客户端模块图、会话存储与 profile 数据。Electron 渲染进程加载该源，不修改应用协议。

主进程拥有一个 Harness 子进程和一个应用实例。它把 Host 输出记录到平台日志，以有限指数退避重启异常退出的 Host，普通关闭窗口时将窗口隐藏到托盘，并在明确退出应用前停止子进程。打包版本在随附 Node 运行时上执行部署后的 `@deepseek-ai/dsh` 闭包，不依赖 Electron 内置 Node 或 `PATH` 中的可执行文件。

渲染进程启用上下文隔离，关闭 Node 集成，启用 Electron 渲染沙箱，拒绝权限请求，并阻止离开受监督 loopback 源的导航。外部 HTTP 与 HTTPS 链接交给系统浏览器打开。窗口不安装 preload 桥，也不暴露 Harness 方法或文件系统原语。

打包步骤从 nodejs.org 下载固定版本的 Node 发行包，依据对应版本的 `SHASUMS256.txt` 校验归档，部署生产 CLI 依赖闭包，实体化工作区链接，并在任一阶段不完整时失败。私有桌面 workspace 共享 dsh 发布版本与 tag，但不进入 npm pack 和 publish 操作。本地 macOS 产物不签名；签名与公证仍由分发者负责。

## Alternatives considered

**把 Electron IPC 作为初始载体。** 本次交付不采用。它还需要为 Host 组合的客户端模块图、插件 bundle、下行流和原生 provider 实现 Electron 到达路径，才能取代 Web Host。协议仍允许后续增加 IPC 传输，但桌面产品不依赖这次传输迁移。

**在 Electron 主进程内运行 Harness。** 否决。Electron 内置 Node 版本与 Electron 发行版耦合，而且 Host 故障会终止原生窗口。受监督子进程使用仓库声明的 Node 版本范围，并隔离进程故障。

**使用 Tauri 或原生 Swift 客户端。** 否决。Harness 仍是 Node 应用，完整客户端已经针对 Chromium 构建。Tauri 会增加 Rust 与系统 WebView 兼容面，同时仍需分发 Node；原生 UI 则会重复实现客户端及其行为。

**安装浏览器 PWA。** 否决。用户仍需管理 `dsh web`，而且 PWA 不拥有 Host 启动、重启、日志或应用关闭过程。

## Consequences

桌面应用保留浏览器产品经过测试的 UI 与线上行为，同时增加可双击、自包含的 macOS 安装包。Host 崩溃不会关闭应用，安装包也不依赖用户安装 Node 或 pnpm。

应用同时分发 Chromium 与 Node，因此磁盘与内存占用高于 CLI。loopback HTTP 与 WebSocket 仍属于桌面运行时，但端口随机且仅绑定 `127.0.0.1`。Electron 不会为模型驱动的子进程增加操作系统沙箱。本地 DMG 在公开分发前需要由发布者签名并公证。

GUI 分层记录仍保持活跃，因为其中的包边界、协议模型和 IPC 扩展点仍会指导后续工作；本记录只取代其“首个 Electron 产品不复用 Web 载体”的假设。
