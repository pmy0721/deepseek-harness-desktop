# DeepSeek Harness

[English](README.md) | 中文

DeepSeek Harness（`dsh`）是由 [DeepSeek AI](https://deepseek.com) 开发的开源 agent harness（智能体框架）。

它采用**一切皆插件**的架构，并由 [Cordis](https://github.com/cordiverse/cordis) 驱动，其设计参见论文 [_A Programming Paradigm for Spatiotemporal Composability_](https://github.com/cordiverse/paper)。

## 桌面发行版

本仓库在上游 DeepSeek Harness 源码中加入了社区维护的桌面应用。它不是 DeepSeek 官方产品。构建、运行、安全性、限制与源码来源见[桌面应用文档](apps/desktop/README.md)。

### 桌面版本更新

仓库级 package 版本仍由根目录发布流程统一管理。

#### 0.1.0-rc.7 — 2026-08-18

- 集成官方 `dsh-v0.1.0-rc.7` 源码基线，同时保留受监督桌面 Host、强化的 Electron 窗口、托盘生命周期和随附运行时。
- 纳入官方的插件自有设置界面、可折叠问题输入卡、一次性后台子代理、大型历史记录分页修复、Safari 文本框回流修复、终端修复和 DeepSeek token 上限对齐。
- 完成 macOS 与 Windows 原生窗口适配，覆盖应用框架、侧边栏、会话标题栏、模态框拖拽处理和工作区淡化行为。
- 加入 90 秒 Host 就绪时限、有限长度的近期输出诊断、错误页面、进程终止和受监督重启。
- 加入 Electron Builder `afterPack` 检查，验证随附 Node 可执行文件、dsh CLI 入口和 Web 前端入口，并覆盖 macOS 与 Windows 配置测试。
- 评估 Electron 43 随附的 Node 运行时后，保留独立 Node 22 运行时。Electron 的 Node 24 可以加载 `node-pty`，但组装后的 Host 还需要 `--expose-internals`。
- 保持个人自用构建不签名、不公证。公开分发仍是独立的 Developer ID 签名与公证流程。

#### 0.1.0-rc.5 — 2026-08-14

- 加入自包含 Electron 桌面壳、受监督 loopback Web Host、托盘托管生命周期、随附 Node 运行时、本地 macOS DMG 配置和来源披露。

## 开发者预览

DeepSeek Harness 目前处于 _开发者预览_ 阶段，正在快速迭代。**未来将出现破坏兼容性的变更。**

## 运行

### 通过 `npm` 运行

安装 `Node.js`，然后运行：

```sh
npx @deepseek-ai/dsh web
```

该命令会启动 Web UI，默认地址为 `http://127.0.0.1:3080`。详见 [Web UI 指南](docs/user/guide/index.md)。

### 从源码运行

如需从仓库源码运行：

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

## 社区与支持

- 欢迎通过 [GitHub Discussions](https://github.com/deepseek-ai/deepseek-harness/discussions) 提交反馈或 bug 报告。
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
      <td align="center"><img src="assets/community-wecom-assistant.png" alt="DeepSeek Harness 企微小助手二维码" width="180" height="180"></td>
      <td align="center"><a href="https://trtgsjkv6r.feishu.cn/share/base/form/shrcnIt5twSVdLGD52KJBckGCgg"><img src="assets/community-wecom-survey.png" alt="DeepSeek Harness 入群问卷二维码" width="180" height="180"></a></td>
      <td align="center"><img src="assets/community-wechat-official-account.png" alt="DeepSeek Harness 团队微信公众号二维码" width="180" height="180"></td>
    </tr>
  </tbody>
</table>

## 参与贡献

参见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 开发

请先阅读[开发指南](docs/development.md)与[架构文档](docs/architecture.md)。

面向 agent：请遵循 [AGENTS.md](AGENTS.md)。

## 许可证

[MIT](LICENSE)

第三方依赖及其许可证见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
