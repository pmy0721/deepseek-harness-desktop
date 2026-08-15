# Desktop 版本更新

[English](README.md) | 中文

本文件记录桌面发行版变更。仓库级 package 版本仍由根目录发布流程统一管理。

## 未发布 — 2026-08-15

- 完成 macOS 与 Windows 原生窗口适配，覆盖应用框架、侧边栏、会话标题栏、模态框拖拽处理和工作区淡化行为。
- 加入 90 秒 Host 就绪时限、有限长度的近期输出诊断、错误页面、进程终止和受监督重启。
- 加入 Electron Builder `afterPack` 检查，验证随附 Node 可执行文件、dsh CLI 入口和 Web 前端入口，并覆盖 macOS 与 Windows 配置测试。
- 评估 Electron 43 随附的 Node 运行时后，保留独立 Node 22 运行时。Electron 的 Node 24 可以加载 `node-pty`，但组装后的 Host 还需要 `--expose-internals`。
- 保持个人自用构建不签名、不公证。公开分发仍是独立的 Developer ID 签名与公证流程。

## 0.1.0-rc.5 — 2026-08-14

- 加入自包含 Electron 桌面壳、受监督 loopback Web Host、托盘托管生命周期、随附 Node 运行时、本地 macOS DMG 配置和来源披露。
