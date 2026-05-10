# dictapp

> CLI tool for managing i18n translation files with LLM-powered automation.  
> 基于大模型的国际化翻译管理 CLI 工具。

📦 [GitHub](https://github.com/wangyuanxing/dict-app) · [npm](#install)

[English](#english) | [中文](#中文)

---

## English

### Overview

`dictapp` is a command-line tool that connects your frontend project's locale files to the **Dict-App** translation server. It lets you:

- **Upload** locale files to a centralized translation server
- **Download** AI-translated results back into your project after LLM-powered translation completes

The server handles translation via configurable LLM providers (OpenAI, Claude, DeepSeek, or any OpenAI-compatible endpoint).

### Install

**Option A — Global install (recommended for direct CLI usage):**

```bash
npm install -g dictapp
```

After global install, `dictapp` is available as a shell command anywhere:

```bash
dictapp upload
dictapp -u
dictapp download
dictapp -d
```

**Option B — Local install + npx:**

```bash
npm install --save-dev dictapp
```

With a local install, use `npx` to run the command (no global install needed):

```bash
npx dictapp upload
npx dictapp -u
npx dictapp download
```

**Option C — Local install + npm scripts:**

```bash
npm install --save-dev dictapp
```

Add scripts to your `package.json`:

```json
{
  "scripts": {
    "dict:upload": "dictapp upload",
    "dict:download": "dictapp download"
  }
}
```

Then run:

```bash
npm run dict:upload
npm run dict:download
```

> **Note:** Inside npm scripts, `dictapp` is resolved from `node_modules/.bin/` automatically — no prefix needed.

### Server Setup

The Dict-App server + admin panel is needed to create projects, configure LLM providers, and trigger translations. See the full project repository for details:

**[github.com/wangyuanxing/dict-app](https://github.com/wangyuanxing/dict-app)**

Quick local setup:

```bash
git clone https://github.com/wangyuanxing/dict-app.git
cd dict-app

# Start the server (Python 3, Flask)
cd server
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py                # Runs on http://localhost:5050

# Start the web admin panel (Node.js 22+, React + Ant Design)
cd ../web
npm install
npx vite                     # Runs on http://localhost:3000
```

Then open `http://localhost:3000`, create a project to get your `projectId` and `apiKey`.

### Quick Start

**1. Add config to your project's `package.json`:**

```json
{
  "dictapp": {
    "projectId": "<your-project-id>",
    "apiKey": "<your-api-key>",
    "serverUrl": "https://your-dict-server.example.com",
    "localeDir": "locale"
  }
}
```

> Get `projectId` and `apiKey` from your Dict-App server admin panel.

**2. Prepare your locale files:**

```
your-project/
├── package.json
└── locale/
    ├── zh_CN.json     ← source language (fully translated)
    ├── en_US.json     ← reference language
    ├── ja_JP.json     ← empty {}, waiting for AI translation
    └── fr_FR.json     ← empty {}, waiting for AI translation
```

**3. Upload locale files to the server:**

```bash
dictapp upload       # global install
# or if installed locally:
npx dictapp upload   # local install
```

This scans `localeDir`, flattens nested JSON keys, and sends all entries to the server.

**4. Go to the server admin panel** → configure an LLM provider → create translation tasks (e.g. zh_CN → ja_JP, fr_FR).

**5. Once translations complete, download them back:**

```bash
dictapp download     # global install
# or if installed locally:
npx dictapp download # local install
```

All translated locale files are written back to your `localeDir`, with nested JSON structure restored.

### Commands

| Command | Alias | Description |
|---|---|---|
| `dictapp upload` / `npx dictapp upload` | `dictapp -u` | Upload all `.json` files in `localeDir` to the server |
| `dictapp download` / `npx dictapp download` | `dictapp -d` | Download all translated locales from the server, overwrite local files |
| `dictapp --help` | | Show help |
| `dictapp --version` | | Show version |

### Configuration (`package.json`)

| Field | Required | Description |
|---|---|---|
| `dictapp.projectId` | Yes | Project ID from Dict-App server admin panel |
| `dictapp.apiKey` | Yes | API key for authentication |
| `dictapp.serverUrl` | Yes | Dict-App server URL (e.g. `https://dict.example.com`) |
| `dictapp.localeDir` | Yes | Relative path to your locale files directory |

### How it Works

- **Nested JSON support**: Locale files with nested objects are automatically flattened to dot-notation keys (e.g. `nav.home`) on upload, and restored to nested objects on download.
- **Placeholder preservation**: The LLM translation prompts enforce preserving `{variable}`, `%s`, `<tags>` and other common placeholders.
- **Retry on failure**: Network errors trigger up to 3 automatic retries with exponential backoff.

### License

MIT

---

## 中文

### 概述

`dictapp` 是一个命令行工具，将你前端项目中的国际化语言文件与 **Dict-App** 翻译服务端连接。它可以：

- **上传** locale 文件到翻译服务端
- **下载** 大模型翻译完成的多语言结果，覆盖回本地项目

服务端支持配置多种大模型进行翻译（OpenAI、Claude、DeepSeek、或任意 OpenAI 兼容接口）。

### 安装

**方式 A — 全局安装（推荐，可直接在命令行使用）：**

```bash
npm install -g dictapp
```

全局安装后，`dictapp` 作为 shell 命令随处可用：

```bash
dictapp upload
dictapp -u
dictapp download
dictapp -d
```

**方式 B — 本地安装 + npx：**

```bash
npm install --save-dev dictapp
```

本地安装后，通过 `npx` 运行命令（无需全局安装）：

```bash
npx dictapp upload
npx dictapp -u
npx dictapp download
```

**方式 C — 本地安装 + npm scripts：**

```bash
npm install --save-dev dictapp
```

在 `package.json` 中添加 scripts：

```json
{
  "scripts": {
    "dict:upload": "dictapp upload",
    "dict:download": "dictapp download"
  }
}
```

然后通过 npm scripts 运行：

```bash
npm run dict:upload
npm run dict:download
```

> **说明：** 在 npm scripts 中，`dictapp` 会自动从 `node_modules/.bin/` 解析，无需前缀。

### 服务端部署

Dict-App 服务端 + 管理后台用于创建项目、配置大模型、触发翻译任务。完整项目文档请查看：

**[github.com/wangyuanxing/dict-app](https://github.com/wangyuanxing/dict-app)**

本地快速启动：

```bash
git clone https://github.com/wangyuanxing/dict-app.git
cd dict-app

# 启动服务端（Python 3, Flask）
cd server
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py                # 运行在 http://localhost:5050

# 启动管理后台（Node.js 22+, React + Ant Design）
cd ../web
npm install
npx vite                     # 运行在 http://localhost:3000
```

打开 `http://localhost:3000`，创建项目获取 `projectId` 和 `apiKey`。

### 快速开始

**1. 在项目 `package.json` 中添加配置：**

```json
{
  "dictapp": {
    "projectId": "<你的项目ID>",
    "apiKey": "<你的API密钥>",
    "serverUrl": "https://your-dict-server.example.com",
    "localeDir": "locale"
  }
}
```

> 在 Dict-App 服务端管理后台创建项目，获取 `projectId` 和 `apiKey`。

**2. 准备语言文件：**

```
your-project/
├── package.json
└── locale/
    ├── zh_CN.json     ← 源语言（完整翻译）
    ├── en_US.json     ← 参考语言
    ├── ja_JP.json     ← 空文件 {}，等待AI翻译
    └── fr_FR.json     ← 空文件 {}，等待AI翻译
```

**3. 上传语言文件到服务端：**

```bash
dictapp upload       # 全局安装
# 本地安装时使用：
npx dictapp upload   # 本地安装
```

自动扫描 `localeDir`，将嵌套 JSON 扁平化后上传。

**4. 前往服务端管理后台** → 配置大模型 → 创建翻译任务（如 zh_CN → ja_JP、fr_FR）。

**5. 翻译完成后，拉取结果：**

```bash
dictapp download     # 全局安装
# 本地安装时使用：
npx dictapp download # 本地安装
```

所有已翻译的语言文件会写入 `localeDir`，自动恢复嵌套 JSON 结构。

### 命令

| 命令 | 简写 | 说明 |
|---|---|---|
| `dictapp upload` / `npx dictapp upload` | `dictapp -u` | 上传 `localeDir` 下所有 `.json` 文件到服务端 |
| `dictapp download` / `npx dictapp download` | `dictapp -d` | 从服务端下载所有已翻译语言，覆盖本地文件 |
| `dictapp --help` | | 查看帮助 |
| `dictapp --version` | | 查看版本号 |

### 配置项 (`package.json`)

| 字段 | 必填 | 说明 |
|---|---|---|
| `dictapp.projectId` | 是 | 服务端管理后台创建的项目 ID |
| `dictapp.apiKey` | 是 | 项目对应的 API 密钥 |
| `dictapp.serverUrl` | 是 | 服务端地址（如 `https://dict.example.com`） |
| `dictapp.localeDir` | 是 | locale 文件夹的相对路径 |

### 工作原理

- **嵌套 JSON 支持**：上传时自动将嵌套对象扁平化为点号分隔的 key（如 `nav.home`），下载时还原为嵌套对象。
- **占位符保护**：LLM 翻译提示词强制保留 `{variable}`、`%s`、`<tags>` 等常见占位符。
- **失败重试**：网络错误自动重试 3 次，采用指数退避策略。

### License

MIT
