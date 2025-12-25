<!--- README.md --->

<div align="center">
    <img src="./avatar.png" alt="sakiko" width="200"/>
    <h1>Sakiko</h1>
    <img src="https://img.shields.io/badge/typescript-5.0+-blue?logo=typescript" alt="TS"/>
    <img src="https://img.shields.io/badge/Node.js-24.12+-green?logo=nodedotjs" alt="Node.js"/>
    <img src="https://img.shields.io/badge/Bun-1.3.2+-orange?logo=bun" alt="Bun"/>
    <a href="https://togawa-dev.github.io/docs/"><img src="https://img.shields.io/badge/docs-Github_Pages-purple?logo=docusaurus" alt="Docs"/></a>
    <p></p>
    <p>A scalable cross-platform chatbot framework, simple yet stupidly powerful.</p>
    <p>一个可扩展、跨平台的聊天机器人框架，简洁而不简单。</p>
</div>

> The Project Name `Sakiko` comes from the band _Ave Mujica_'s keyboardist **_豊川（とがわ） 祥子（さきこ）_** (Togawa **Sakiko** a.k.a _Oblivionis_) in the cross-media project _BanG Dream!_<br>

## 快速开始

请参考 [文档](https://togawa-dev.github.io/docs/) 以获取最新的快速开始指南。

### 安装 / Installation

```bash
npm i @togawa-dev/sakiko
```

### 最小示例 / Minimal Example

```typescript
import { Sakiko } from "@togawa-dev/sakiko";
import { fullMatch } from "@togawa-dev/uika/filter";

const sakiko = new Sakiko();

sakiko
    .match(ExampleEvent)
    .filter(fullMatch("foobar"))
    .filter((ctx) => [mergeContext(ctx, { foo: "baz" }), true])
    .handle(async (ctx) => {
        ctx.bot.send(ctx.event, `Hello, World! And you merged ${ctx.foo}`);
    })
    .commit();

sakiko.launch();

// 其实你直接 launch() 也行，总之是跑起来了，虽然没什么用
// well you can just launch(), as long as it runs, even though it has no usefulness at all
```

## 仓库结构 / Repository Structure

这个工作区仓库负责维护以下的 npm 包：

This workspace repository maintains the following npm packages:

### `package/core` 框架核心包 / Core framework package

| 包名 / Package       | 路径 / Path            | 备注/ Notes                                               |
| -------------------- | ---------------------- | --------------------------------------------------------- |
| `@togawa-dev/sakiko` | `packages/core/sakiko` | 框架核心实现 / Core framework implementation              |
| `@togawa-dev/umiri`  | `packages/core/umiri`  | 本地事件总线实现 / Local event bus implementation         |
| `@togawa-dev/uika`   | `packages/core/uika`   | 可选的高级功能扩展 / Optional advanced feature extensions |
| `@togawa-dev/utils`  | `packages/core/utils`  | 内部工具库 / General utility library                      |

### `package/protocol` 协议数据结构包 / Protocol data structure packages

| 包名 / Package               | 路径 / Path               | 备注/ Notes                           |
| ---------------------------- | ------------------------- | ------------------------------------- |
| `@togawa-dev/protocol-milky` | `packages/protocol/milky` | milky 协议实现 / milky protocol impl. |

### `package/adapter` 适配器实现包 / Adapter implementation packages

| 包名 / Package              | 路径 / Path              | 备注/ Notes                            |
| --------------------------- | ------------------------ | -------------------------------------- |
| `@togawa-dev/adapter-milky` | `packages/adapter/milky` | milky 适配器实现 / milky adapter impl. |

### `package/plugin` 插件实现包 / Plugin implementation packages

| 包名 / Package            | 路径 / Path            | 备注/ Notes                            |
| ------------------------- | ---------------------- | -------------------------------------- |
| `@togawa-dev/plugin-echo` | `packages/plugin/echo` | echo 插件 / echo plugin implementation |

### 特性 / Features

### 🚀 开发者友好 / Developer Friendly

Sakiko 提供简洁且语义清晰的 API，将复杂能力封装在直观的方法中，让开发者专注于业务本身，而不是框架细节。
框架坚持少依赖、轻量化设计，避免臃肿的依赖树，保持高效与可维护性。

借助 TypeScript 强大的类型推导与类型组合能力，Sakiko 在编译期提供准确的类型提示，减少运行时错误，并确保类型在复杂处理流程中始终正确传递。

Sakiko offers a minimal and expressive API, hiding complexity behind simple abstractions so developers can focus on business logic instead of framework internals.
With a lightweight, low-dependency philosophy, it stays fast and easy to maintain.

Powered by TypeScript’s advanced type inference and composition, Sakiko delivers precise type hints at compile time, reducing runtime errors and ensuring type safety throughout complex pipelines.

### ✍️ 脚本化 / Scripting

Sakiko 不依赖脚手架工具。
从配置、插件安装到应用启动和事件处理，全部可以在一个 index.ts 文件中完成。

你既能享受 TypeScript 带来的强类型提示，又能完全掌控项目结构——代码写在哪、怎么组织，完全由你决定。

Sakiko avoids scaffolding tools.
Configuration, plugin setup, app startup, and event handling can all live in a single index.ts.

You get strong TypeScript typing while retaining full control over your project structure, with no imposed conventions.

### 🧩 可扩展、可插拔 / Scalable & Pluggable

Sakiko 通过灵活的插件系统扩展功能。
插件既可以只处理一个事件，也可以注入完整的功能模块，并支持无副作用的动态加载与卸载。

你可以按需安装插件，或用插件系统来组织和拆分自己的代码。

Sakiko features a flexible plugin system for extending functionality.
Plugins range from simple event handlers to full-feature modules, and can be dynamically added or removed without side effects.

Install only what you need, or use plugins as a clean way to structure your codebase.

## 开发进度 / Development Progress

距离下个次要版本的发布还有这些要做的东西：

- mutsumi 命令解析器以及对应的uika子包的开发
- onebot v11 的协议数据结构定义&适配器实现
- 继续优化框架中中间件的设计
