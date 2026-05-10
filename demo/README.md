# Dict-App Demo

A showcase frontend application demonstrating Dict-App's i18n internationalization workflow — locale file management, runtime language switching, and `dictapp` CLI integration.

[中文](#中文)

---

## Features

- **Multi-language runtime switching** — 10 locale files loaded dynamically via `i18next`
- **Vite glob-based locale discovery** — Add a `.json` file to `locale/` and it's automatically available
- **`dictapp` CLI integration** — `npm run dict:upload` / `npm run dict:download` sync with the server
- **Local/remote package toggle** — Switch between local dev version of `dictapp` and npm registry version

## Project Structure

```
demo/
├── index.html                  # Entry HTML
├── package.json                # Dependencies & scripts (dictapp config here)
├── vite.config.js              # Vite dev server on port 4000
├── .nvmrc                      # Node.js version pin (22)
├── public/                     # Static assets
├── locale/                     # i18n locale JSON files (10 languages)
│   ├── zh_CN.json              #   Source/fallback language
│   ├── en_US.json
│   ├── ja_JP.json
│   ├── ko_KR.json
│   ├── fr_FR.json
│   ├── de_DE.json
│   ├── it_IT.json
│   ├── nl_NL.json
│   ├── ru_RU.json
│   └── ar_SA.json
└── src/
    ├── main.jsx                # React entry point
    ├── App.jsx                 # Router & layout
    ├── i18n.js                 # i18next setup (glob import, label map)
    ├── index.css               # Global styles
    ├── components/
    │   └── LocaleSwitcher.jsx  # Language selector dropdown
    └── pages/
        ├── Dashboard.jsx       # Home page with stats & charts
        ├── Products.jsx        # Product listing table
        └── Orders.jsx          # Order management table
```

## Quick Start

### Prerequisites

- **Node.js** >= 18 (recommend 22+, see `.nvmrc`)
- A running **Dict-App server** (default `http://localhost:5050`)

### Install & Run

```bash
cd demo
npm install
npm run dev
# Open http://localhost:4000
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (port 4000) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run dict:upload` | Upload `locale/` files to Dict-App server |
| `npm run dict:download` | Download translations from Dict-App server |
| `npm run use:local` | Switch `dictapp` to local dev version (`../cli`) |
| `npm run use:remote` | Switch `dictapp` to npm registry version |

## Switching Between Local and Remote `dictapp`

When developing the CLI itself, you can link it locally to test changes in real time:

```bash
# Use local dev version (symlinks ../cli into node_modules)
npm run use:local

# Switch back to npm registry version (^1.0.0-beta.0)
npm run use:remote
```

After running either command, `dictapp` is available as a global shell command — run `dictapp upload` / `dictapp -u` directly without `npx` or `npm run`.

## How i18n Works

### Locale File Discovery

`src/i18n.js` uses Vite's `import.meta.glob` to auto-discover all `.json` files in `locale/` at build time:

```js
const localeModules = import.meta.glob('../locale/*.json', { eager: true });
```

To add a new language, simply drop a `{locale_code}.json` file (e.g., `es_ES.json`) into `locale/` — it will be picked up automatically with no code changes.

### Configuration

The `dictapp` section in `package.json` tells the CLI where the server is and how to authenticate:

```json
{
  "dictapp": {
    "projectId": "910e6f142e1e",
    "apiKey": "9afad0b0ac7e0db7d33981a50838bdfe",
    "serverUrl": "http://localhost:5050",
    "localeDir": "locale"
  }
}
```

### Translation Workflow

1. Write locale keys in your source language (e.g., `zh_CN.json`)
2. Run `npm run dict:upload` to push them to the server
3. Use the Web Admin to configure LLM and trigger translation tasks
4. Run `npm run dict:download` to pull translated files back into `locale/`

## Adding a New Language

1. Create a new file in `locale/`, e.g., `es_ES.json`
2. Optionally add a label in `src/i18n.js` → `LABEL_MAP`
3. Upload to the server: `npm run dict:upload`
4. Trigger translation for the new language in the Web Admin
5. Download: `npm run dict:download`

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | React 18 |
| Routing | React Router 6 |
| i18n | i18next + react-i18next |
| Build | Vite 6 |
| CLI Tool | dictapp (npm package) |

---

## 中文

Dict-App 的示例前端应用，展示 i18n 国际化工作流——locale 文件管理、运行时语言切换及 `dictapp` CLI 集成。

### 功能特性

- **多语言运行时切换** — 通过 `i18next` 动态加载 10 种语言文件
- **Vite glob 自动发现 locale** — 在 `locale/` 目录下新增 `.json` 文件即可被自动识别
- **`dictapp` CLI 集成** — `npm run dict:upload` / `npm run dict:download` 与服务端同步
- **本地/远程包切换** — 可在本地开发版和 npm 仓库版之间灵活切换 `dictapp`

### 项目结构

同上（见英文部分）。

### 快速开始

#### 环境要求

- **Node.js** >= 18（推荐 22+，见 `.nvmrc`）
- 需启动 **Dict-App 服务端**（默认 `http://localhost:5050`）

#### 安装运行

```bash
cd demo
npm install
npm run dev
# 访问 http://localhost:4000
```

### 可用脚本

| 脚本 | 说明 |
|--------|-------------|
| `npm run dev` | 启动 Vite 开发服务器（端口 4000） |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 预览生产构建 |
| `npm run dict:upload` | 将 `locale/` 文件上传到 Dict-App 服务端 |
| `npm run dict:download` | 从 Dict-App 服务端下载翻译结果 |
| `npm run use:local` | 将 `dictapp` 切换为本地开发版（`../cli`） |
| `npm run use:remote` | 将 `dictapp` 切换为 npm 仓库版 |

### 切换 dictapp 本地/远程版本

当需要调试 CLI 本身时，可以链接本地版本实时测试：

```bash
# 使用本地开发版（将 ../cli 通过 symlink 链接到 node_modules）
npm run use:local

# 切回 npm 仓库版本 (^1.0.0-beta.0)
npm run use:remote
```

执行任一命令后，`dictapp` 即作为全局 shell 命令可用——无需 `npx` 或 `npm run`，直接运行 `dictapp upload` / `dictapp -u` 即可。

### i18n 工作原理

#### Locale 文件自动发现

`src/i18n.js` 使用 Vite 的 `import.meta.glob` 在构建时自动发现 `locale/` 目录下所有 `.json` 文件：

```js
const localeModules = import.meta.glob('../locale/*.json', { eager: true });
```

新增语言只需将 `{语言代码}.json` 文件（如 `es_ES.json`）放入 `locale/` 目录，无需修改代码即可自动加载。

#### 配置说明

`package.json` 中 `dictapp` 字段用于告知 CLI 服务端地址和认证信息：

```json
{
  "dictapp": {
    "projectId": "910e6f142e1e",
    "apiKey": "9afad0b0ac7e0db7d33981a50838bdfe",
    "serverUrl": "http://localhost:5050",
    "localeDir": "locale"
  }
}
```

#### 翻译工作流

1. 在源语言文件（如 `zh_CN.json`）中编写翻译 key
2. 运行 `npm run dict:upload` 将内容推送到服务端
3. 在 Web 管理界面中配置大模型并触发翻译任务
4. 运行 `npm run dict:download` 将翻译结果拉回 `locale/` 目录

### 新增语言

1. 在 `locale/` 下创建新文件，如 `es_ES.json`
2. （可选）在 `src/i18n.js` 的 `LABEL_MAP` 中添加显示名称
3. 上传到服务端：`npm run dict:upload`
4. 在 Web 管理界面中对新语言触发翻译任务
5. 下载翻译：`npm run dict:download`

### 技术栈

| 组件 | 技术 |
|-----------|------------|
| 框架 | React 18 |
| 路由 | React Router 6 |
| 国际化 | i18next + react-i18next |
| 构建 | Vite 6 |
| CLI 工具 | dictapp (npm 包) |
