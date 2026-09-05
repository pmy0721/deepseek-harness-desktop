# DeepSeek Harness

[English](README.md) | 中文

DeepSeek Harness（`dsh`）是由 [DeepSeek AI](https://deepseek.com) 开发的开源 agent harness（智能体框架）。

它构建于**一切皆插件**的架构之上，由 [Cordis](https://github.com/cordiverse/cordis) 驱动，其设计参见论文 [_A Programming Paradigm for Spatiotemporal Composability_](https://arxiv.org/abs/2608.25512)。

文档：[https://deepseek-harness.github.io/deepseek-harness/](https://deepseek-harness.github.io/deepseek-harness/)

## 桌面发行版

本仓库在上游 DeepSeek Harness 源码中加入了社区维护的桌面应用。它不是 DeepSeek 官方产品。构建、运行、安全性、限制与源码来源见[桌面应用文档](apps/desktop/README.zh.md)。

### 桌面版本更新

仓库级 package 版本仍由根目录发布流程统一管理。带日期的桌面每日开发记录与版本发布记录分别保留。

#### 0.1.3-alpha.1 — 2026-09-05

- 集成官方 `dsh-v0.1.3-alpha.1` 基线，保留受监督的 Desktop Host、加固窗口、托盘生命周期、原生侧栏和随包运行时。
- 加入通用文件上传、图片工具卡、Skill 模糊搜索、环境变量代理支持和扩展模型发现。
- 包含暂停目标取消执行、流式工具调用、会话搜索和缓存修复，以及子 Agent 双向消息。
- 采用 Session v2 格式、不可变代际迁移、生命周期持有的句柄和进程锁。官方说明部分历史会话加载存在已知性能回退。

#### 0.1.2-alpha.1 — 2026-08-29

- 集成官方 `dsh-v0.1.2-alpha.1` 源码基线，同时保留受监督 Desktop Host、强化的 Electron 窗口、托盘生命周期和随附运行时。
- 纳入会话过程折叠、精确 token 用量、紧凑回合导航、自适应正文宽度、字号设置、改进的图片处理，以及会话运行期间的排队发送。
- 纳入可配置的子代理模型与推理力度、更完整的 ACP 支持、提供方登录界面、第三方界面语言，以及 DeepSeek 官方插件清单和可选 Session 日志上传集成。
- 采用带 token 鉴权的 Web 启动、由 profile 负责的应用启动、`@Remote` 网关、PTC mode 命名、WebSocket 心跳，以及上游 shell、preset、session 与 WebFetch 修复。

#### 0.1.1-rc.2 — 2026-08-22

- 集成官方 `dsh-v0.1.1-rc.2` 源码基线，同时保留受监督桌面 Host、强化的 Electron 窗口、托盘生命周期和随附运行时。
- 加入 `DeepSeek-V4-Flash-Vision-Exp` 模型、Files API 图片上传复用，以及根据模型要求自动缩放图片和转换格式。
- 纳入 Bubblewrap `/proc/<pid>/root` 限制绕过修复，以及上游会话投影、凭据授权和静态 Web 交付改进。
- 纳入多行问题回答，以及上游输入框引用、Markdown 表格、缓存命中率显示和子代理导航修复。

#### 0.1.0-rc.8 — 2026-08-21

- 集成官方 `dsh-v0.1.0-rc.8` 源码基线，同时保留受监督桌面 Host、强化的 Electron 窗口、托盘生命周期和随附运行时。
- 纳入 DeepSeek 原生图片请求、命令图文输入、文件与会话引用、可安装的 Claude Code 和 Codex 子代理、持久 PowerShell 终端、并发 Web 搜索，以及上游 UI 与会话性能修复。
- 为受监督 Host 关闭 CLI 的默认浏览器交接，因为产品窗口由 Electron 管理。
- 选择性 SQLite 部署采用 schema 17；已有 schema 版本不兼容，必须使用新数据库。随附 Web profile 继续使用 JSONL 持久化。

#### 0.1.0-rc.7 — 2026-08-18

- 集成官方 `dsh-v0.1.0-rc.7` 源码基线，同时保留受监督桌面 Host、强化的 Electron 窗口、托盘生命周期和随附运行时。
- 纳入官方的插件自有设置界面、可折叠问题输入卡、一次性后台子代理、大型历史记录分页修复、Safari 文本框回流修复、终端修复和 DeepSeek token 上限对齐。

#### 每日开发记录 — 2026-08-15

- 完成 macOS 与 Windows 原生窗口适配，覆盖应用框架、侧边栏、会话标题栏、模态框拖拽处理和工作区淡化行为。
- 加入 90 秒 Host 就绪时限、有限长度的近期输出诊断、错误页面、进程终止和受监督重启。
- 加入 Electron Builder `afterPack` 检查，验证随附 Node 可执行文件、dsh CLI 入口和 Web 前端入口，并覆盖 macOS 与 Windows 配置测试。
- 评估 Electron 43 随附的 Node 运行时后，保留独立 Node 22 运行时。Electron 的 Node 24 可以加载 `node-pty`，但组装后的 Host 还需要 `--expose-internals`。
- 保持个人自用构建不签名、不公证。公开分发仍是独立的 Developer ID 签名与公证流程。

#### 0.1.0-rc.5 — 2026-08-14

- 加入自包含 Electron 桌面壳、受监督 loopback Web Host、托盘托管生命周期、随附 Node 运行时、本地 macOS DMG 配置和来源披露。

## 开发者预览

DeepSeek Harness 处于 _开发者预览_ 阶段，正在快速迭代。**未来将出现破坏兼容性的变更。**

运行本项目前，请阅读[安全说明](SAFETY.zh.md)。

<a id="run"></a>

## 运行

### 通过 `npm` 运行

安装 `Node.js`，然后运行：

```sh
npx @deepseek-ai/dsh web
```

该命令默认会在 `http://127.0.0.1:3080` 启动 Web UI，本机启动时还会用默认浏览器打开页面。通过 SSH 启动时只打印宿主机 URL，因为本地转发地址由 SSH 客户端或编辑器持有。传入 `--no-open` 可仅运行服务器而不打开浏览器。详见 [Web UI 指南](docs/user/guide/index.zh.md)。

<a id="run-from-source"></a>

### 从源码运行

如需从仓库源码运行：

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

`pnpm run build` 会准备仓库产物。`pnpm dsh web` 会直接使用这些已构建产物，不会重新构建。

## 社区与支持

- 通过 [GitHub Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions) 提交反馈或 bug 报告。
- 为你的插件仓库添加 [`dsh-plugin`](https://github.com/topics/dsh-plugin) 话题，便于被发现。
- 欢迎加入 DeepSeek Harness 企微群：扫码添加企微小助手并填写入群问卷，完成后小助手会邀请你入群。

<table>
  <thead>
    <tr>
      <th align="center">企微小助手</th>
      <th align="center">入群问卷</th>
      <th align="center">微信公众号</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center"><img src="https://cdn.deepseek.com/harness/readme/community-wecom-assistant.png" alt="DeepSeek Harness 企微小助手二维码" width="180" height="180"></td>
      <td align="center"><a href="https://trtgsjkv6r.feishu.cn/share/base/form/shrcnIt5twSVdLGD52KJBckGCgg"><img src="https://cdn.deepseek.com/harness/readme/community-wecom-survey.png" alt="DeepSeek Harness 入群问卷二维码" width="180" height="180"></a></td>
      <td align="center"><img src="https://cdn.deepseek.com/harness/readme/community-wechat-official-account.png" alt="DeepSeek Harness 团队微信公众号二维码" width="180" height="180"></td>
    </tr>
  </tbody>
</table>

## 参与贡献

参见 [CONTRIBUTING.md](CONTRIBUTING.zh.md)。

## 开发

请先阅读[开发指南](docs/development.zh.md)与[架构文档](docs/architecture.zh.md)。

面向 agent：请遵循 [AGENTS.md](AGENTS.md)。

## 许可证

[MIT](LICENSE)

第三方依赖及其许可证见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
