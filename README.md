<!--- README.md --->

<div align="center">
    <img src="./avatar.png" alt="sakiko" width="200"/>
    <h1>Sakiko （🚧 开发中分支）</h1>
    <img src="https://img.shields.io/badge/typescript-5.0+-blue?logo=typescript" alt="TS"/>
    <img src="https://img.shields.io/badge/Node.js-24.12+-green?logo=nodedotjs" alt="Node.js"/>
    <img src="https://img.shields.io/badge/Bun-1.3.2+-orange?logo=bun" alt="Bun"/>
    <a href="https://togawa-dev.github.io/docs/"><img src="https://img.shields.io/badge/docs-Github_Pages-purple?logo=docusaurus" alt="Docs"/></a>
    <p></p>
    <p>A scalable cross-platform chatbot framework, simple yet stupidly powerful.</p>
    <p>一个可扩展、跨平台的聊天机器人框架，简单好用且功能丰富。</p>
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

## 特性 / Features

### 开发者友好 / Developer Friendly

Sakiko 追求极简且语义明确的API设计，把复杂的功能封装到简洁的方法中，让开发者可以专注于业务逻辑本身的实现，而不是花时间应对框架本身。同时，Sakiko 总是倾向于使用更少的依赖来解决问题，保持框架的轻量和高效，开发者不必为庞大而臃肿的依赖树担忧。

Sakiko 尽力保证了类型安全，通过 TypeScript 强大的编译期类型推导能力，开发者可以在编写代码时获取准确而详实的类型提示，得到更好的开发体验和更少的运行时类型错误。同时，通过 TypeScript ~~邪门~~强大的对象魔法，Sakiko 能够灵活的组合上下文的属性和类型，确保在复杂的处理链路中正确传递每一份类型提示和注释文本。

Sakiko pursues a minimalist and semantically clear API design, encapsulating complex features into simple methods. This allows developers to focus on implementing business logic rather than dealing with the framework itself. At the same time, Sakiko always prefers to solve problems with fewer dependencies, keeping the framework lightweight and efficient, so developers don't have to worry about a bloated dependency tree.

Sakiko strives to ensure type safety. Through TypeScript's powerful compile-time type inference capabilities, developers can obtain accurate and detailed type hints while writing code, resulting in a better development experience and fewer runtime type errors. Additionally, through TypeScript's ~~magical~~ powerful object manipulation, Sakiko can flexibly combine context properties and types, ensuring the correct transmission of each type hint and annotation text in complex processing chains.

### 脚本化 / Scripting

Sakiko 不使用脚手架工具来创建项目，而是更倾向于用最简单的方法表示应用逻辑，注入配置、安装插件、启动机器人应用甚至事件处理逻辑的编写都完全可以在单个 `index.ts` 文件中实现，在享受用 TypeScript 的强类型提示来配置和编排应用的同时，你最大程度的保有对自己的项目结构的控制权，想怎么写在哪里写完全由你自己决定。

Sakiko does not use scaffolding tools to create projects. Instead, it prefers to express application logic in the simplest way possible. Configuration injection, plugin installation, bot startup, and even event handling logic can all be implemented in a single `index.ts` file. While enjoying the strong type hints of TypeScript for configuring and orchestrating applications, you retain maximum control over your project structure, deciding where and how to write as you see fit.

### 可扩展、可插拔 / Scalable & Pluggable

Sakiko 用规模灵活的插件系统向框架组合扩展各种功能，插件可以小到只是做一点事件处理，也可以在框架中注入复杂的功能模块，同时允许进行无副作用的动态插拔，开发者可以根据自己的需求安装插件，也可以用插件系统组织自己的代码。

Sakiko uses a scalable plugin system to extend various functionalities to the framework. Plugins can be as small as handling a single event or as complex as injecting intricate functional modules into the framework. It also allows for side-effect-free dynamic plugging and unplugging, enabling developers to install plugins based on their needs and organize their code using the plugin system.

## 开发进度 / Development Progress

0.5 分支正在开发中，文档尚未更新。

🚧 巨大 API 变动警告！！！

目前重构进度：

- ✅ 核心迁移完成
- ✅ 更易维护的项目结构
- ✅ 移除 cjs 支持，仅保留 esm
- ⚠️ 简化框架暴露的 API
- ⚠️ uika 的分包可选导入模式
- ⚠️ 通过 changesets 自动化版本发布流程
