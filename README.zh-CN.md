# Dict-App

一个开源的国际化翻译管理工具，支持基于大模型的自动化翻译。通过 CLI 上传 locale 文件，在 Web 管理界面中管理翻译，触发 AI 批量翻译任务，然后将结果下载回项目——全流程一站式完成。

[English](README.md)

## 功能特性

- **CLI 命令行工具** — `dictapp upload` 和 `dictapp download` 一键同步 locale 文件与服务端
- **Web 管理后台** — 可视化管理翻译 key，触发 AI 翻译任务，审核翻译结果
- **多厂商大模型支持** — OpenAI、Anthropic Claude、DeepSeek 及任何兼容 OpenAI 协议的接口
- **占位符保护** — 自动保留 `{variable}`、`%s`、`{{interpolation}}`、ICU 格式和 HTML 标签
- **嵌套 JSON 支持** — 深层嵌套的 JSON 文件自动扁平化后翻译，下载时还原结构
- **任务队列** — 后台异步翻译，实时进度追踪，自动刷新，失败可重试
- **轻量化** — SQLite 数据库，除 Python 和 Node.js 外无额外依赖

## 架构

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   CLI (dictapp)  │────▶│  Flask 服务端     │◀────│  Web 管理界面   │
│   Node.js / npm  │     │  Python / SQLite  │     │  React / Antd   │
│                  │◀────│                   │     │                 │
└─────────────────┘     └────────┬──────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │   大模型 Providers │
                        │  OpenAI/Claude/  │
                        │  DeepSeek/兼容   │
                        └──────────────────┘
```

## 快速开始

### 环境要求

- **Node.js** >= 18（推荐 22+）
- **Python** >= 3.9
- **npm** >= 9

### 1. 克隆并安装

```bash
git clone https://github.com/yourusername/dict-app.git
cd dict-app

# 安装 CLI 和 Web 依赖
npm install

# 搭建 Python 服务端
cd server
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. 启动服务端

```bash
cd server
source venv/bin/activate
python app.py
# 服务运行在 http://localhost:5050
```

### 3. 启动 Web 管理界面

```bash
# 新开一个终端，在项目根目录执行
cd web
npx vite
# 管理界面运行在 http://localhost:3000
```

### 4. 创建项目

1. 浏览器打开 `http://localhost:3000`
2. 点击 **Create Project**，输入项目名称
3. 从表格中复制 **Project ID** 和 **API Key**

### 5. 在前端项目中配置

在你的前端项目的 `package.json` 中添加 `dictapp` 配置段：

```json
{
  "name": "my-frontend-app",
  "dictapp": {
    "projectId": "a1b2c3d4e5f6",
    "apiKey": "生成的-api-key",
    "serverUrl": "http://localhost:5050",
    "localeDir": "locale"
  }
}
```

### 6. 上传 Locale 文件

```bash
# 在你的前端项目目录下执行
dictapp upload         # 全局安装 (npm install -g dictapp)
# 或：
npx dictapp upload     # 本地安装 (npm install --save-dev dictapp)
# 简写: dictapp -u
```

### 7. 配置大模型并翻译

1. 在 Web 管理界面中，进入项目 → **LLM Config**
2. 选择 Provider（如 OpenAI），填写模型名称和 API Key
3. 点击 **Test Connection** 测试连通性
4. 进入 **Translation Tasks** → **New Task**
5. 选择源语言和目标语言
6. 点击 **Start Translation** 开始翻译

### 8. 下载翻译结果

```bash
# 在你的前端项目目录下执行
dictapp download       # 全局安装 (npm install -g dictapp)
# 或：
npx dictapp download   # 本地安装 (npm install --save-dev dictapp)
# 简写: dictapp -d
```

翻译完成后的 locale 文件会自动覆盖到你的项目本地目录中。

## CLI 命令参考

### `dictapp upload`（别名：`dictapp -u`）

扫描配置的 `localeDir` 目录下所有 `.json` 文件，将嵌套结构扁平化后上传所有键值对到服务端。

```bash
dictapp upload           # 全局安装
npx dictapp upload       # 本地安装
# 输出示例：
# Uploaded en_US.json (42 keys)
# Uploaded zh_CN.json (42 keys)
# Done. Uploaded 2 locale file(s).
```

### `dictapp download`（别名：`dictapp -d`）

从服务端下载所有已完成的翻译，写入对应的 locale 文件，并还原嵌套 JSON 结构。

```bash
dictapp download         # 全局安装
npx dictapp download     # 本地安装
# 输出示例：
# Downloaded en_US.json (42 keys)
# Downloaded ja_JP.json (42 keys)
# Done. Downloaded 2 locale file(s).
```

### 配置说明

所有配置均位于项目 `package.json` 的 `dictapp` 字段下：

| 字段 | 必填 | 说明 |
|-------|----------|-------------|
| `projectId` | 是 | 从 Web 管理界面获取的项目 ID |
| `apiKey` | 是 | 从 Web 管理界面获取的 API 密钥 |
| `serverUrl` | 是 | 服务端地址（如 `http://localhost:5050`） |
| `localeDir` | 是 | locale 文件目录的相对路径 |

### 支持的 Locale 文件格式

文件名需为 `.json`，以语言代码命名（如 `zh_CN.json`、`en_US.json`）。支持扁平结构和嵌套结构：

```json
// 扁平结构
{ "nav.home": "首页", "nav.about": "关于" }

// 嵌套结构（上传时自动转为点号分隔的扁平结构）
{
  "nav": { "home": "首页", "about": "关于" },
  "user": { "greeting": "你好，{name}" }
}
```

## Web 管理界面

### 页面功能

| 页面 | 说明 |
|------|-------------|
| **Projects** | 创建、查看、删除项目。复制 Project ID 和 API Key。 |
| **Locales** | 按语言浏览翻译条目。支持搜索、行内编辑和删除。 |
| **Translation Tasks** | 创建批量翻译任务。实时进度监控，自动刷新。 |
| **Task Detail** | 查看每个 key 的翻译状态。支持手动修正和失败重试。 |
| **LLM Config** | 配置大模型 Provider、模型名称和 API Key。支持测试连接。 |

### 支持的大模型

| Provider | 推荐模型 |
|----------|---------------|
| **OpenAI** | gpt-4.1, gpt-4o, gpt-4-turbo |
| **Anthropic Claude** | claude-sonnet-4-6, claude-opus-4-7 |
| **DeepSeek** | deepseek-chat, deepseek-reasoner |
| **OpenAI 兼容** | 任何兼容 OpenAI API 协议的端点 |

## API 参考

基础 URL：`http://localhost:5050/api/v1`

### 认证方式

CLI 和 Web 管理界面的请求均需携带以下两个请求头：
- `X-Project-Id` — 项目 ID
- `X-API-Key` — 项目 API 密钥

### CLI 端点

| 方法 | 路径 | 说明 |
|--------|------|-------------|
| `POST` | `/upload` | 上传 locale 条目 |
| `GET` | `/download` | 下载已完成的翻译 |

### 项目管理

| 方法 | 路径 | 说明 |
|--------|------|-------------|
| `GET` | `/projects` | 获取所有项目 |
| `POST` | `/projects` | 创建项目 |
| `GET` | `/projects/:id` | 获取项目详情 |
| `DELETE` | `/projects/:id` | 删除项目 |

### 翻译条目管理

| 方法 | 路径 | 说明 |
|--------|------|-------------|
| `GET` | `/projects/:id/locales` | 获取已有语言列表 |
| `GET` | `/projects/:id/entries` | 分页查询条目 |
| `PUT` | `/projects/:id/entries/:eid` | 修改条目值 |
| `DELETE` | `/projects/:id/entries/:eid` | 删除条目 |

### 翻译任务

| 方法 | 路径 | 说明 |
|--------|------|-------------|
| `GET` | `/projects/:id/tasks` | 任务列表 |
| `POST` | `/projects/:id/tasks` | 创建翻译任务 |
| `GET` | `/projects/:id/tasks/:tid` | 任务详情 |
| `POST` | `/projects/:id/tasks/:tid/retry` | 重试失败条目 |
| `GET` | `/projects/:id/translations` | 翻译结果列表 |
| `PUT` | `/projects/:id/translations/:tid` | 手动修正翻译值 |

### LLM 配置

| 方法 | 路径 | 说明 |
|--------|------|-------------|
| `GET` | `/projects/:id/llm-config` | 获取大模型配置 |
| `PUT` | `/projects/:id/llm-config` | 保存大模型配置 |
| `POST` | `/projects/:id/llm-config/test` | 测试连接 |

## 项目结构

```
dict-app/
├── cli/                              # NPM CLI 包 (dictapp)
│   ├── package.json
│   ├── bin/dictapp.js                # 入口文件
│   └── src/
│       ├── config.js                 # 读取 package.json 配置
│       ├── upload.js                 # 上传 locale 文件到服务端
│       ├── download.js               # 从服务端下载翻译结果
│       ├── api.js                    # HTTP 客户端（含重试逻辑）
│       └── flat.js                   # 嵌套 JSON ↔ 点号格式互转
│
├── server/                           # Python Flask 后端
│   ├── requirements.txt
│   ├── app.py                        # Flask 应用工厂
│   ├── config.py                     # 服务端配置
│   ├── db.py                         # SQLAlchemy + SQLite 初始化
│   ├── models/                       # 数据库模型
│   │   ├── project.py                # 项目表
│   │   ├── source_entry.py           # 源条目表
│   │   ├── translation.py            # 翻译结果表
│   │   ├── translation_task.py       # 翻译任务表
│   │   └── llm_config.py             # 大模型配置表
│   ├── api/                          # REST API 路由
│   │   ├── cli_routes.py             # CLI 上传/下载接口
│   │   ├── project_routes.py         # 项目管理接口
│   │   ├── locale_routes.py          # 翻译条目管理接口
│   │   ├── task_routes.py            # 翻译任务接口
│   │   └── llm_config_routes.py      # 大模型配置接口
│   ├── services/                     # 业务逻辑
│   │   ├── auth.py                   # API Key 认证中间件
│   │   ├── locale_service.py         # 上传/下载逻辑
│   │   └── translation_service.py    # 翻译任务编排
│   ├── llm/                          # 大模型 Provider 抽象层
│   │   ├── base.py                   # 抽象基类
│   │   ├── openai_provider.py
│   │   ├── anthropic_provider.py
│   │   ├── deepseek_provider.py
│   │   ├── openai_compatible_provider.py
│   │   ├── factory.py                # Provider 工厂
│   │   └── utils.py                  # JSON 响应解析
│   └── prompts/
│       └── translation.py            # 翻译提示词模板
│
└── web/                              # React + Ant Design 管理界面
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx                   # 路由配置
        ├── api/client.js             # Axios 客户端（含认证）
        ├── contexts/ProjectContext.jsx # 项目状态管理
        ├── components/
        │   ├── Layout.jsx            # 侧边栏布局
        │   └── ProjectSelector.jsx   # 项目切换下拉框
        └── pages/
            ├── ProjectList.jsx       # 项目管理页
            ├── LocaleManager.jsx     # 翻译条目浏览页
            ├── TranslationTasks.jsx  # 翻译任务页
            ├── TaskDetail.jsx        # 任务详情页
            └── LLMConfig.jsx         # 大模型配置页
```

## 技术栈

| 组件 | 技术 |
|-----------|-----------|
| CLI | Node.js, Commander, Axios |
| 后端 | Python 3, Flask, SQLAlchemy, SQLite |
| 前端 | React 19, Ant Design 5, React Router 7, Vite 6 |
| 大模型 SDK | OpenAI Python SDK, Anthropic Python SDK |

## 本地开发

### 开发环境搭建

```bash
# 需要 Node.js 22+
nvm use 22

# 安装所有依赖
npm install
cd server && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
cd ..
```

### 启动开发服务器

```bash
# 终端 1：启动 Flask 服务端
cd server && source venv/bin/activate && python app.py

# 终端 2：启动前端开发服务器（热更新）
cd web && npx vite
```

### 本地运行 CLI

```bash
node cli/bin/dictapp.js upload
```

### 数据库

服务端使用 SQLite，数据库文件首次启动时自动创建在 `server/dictapp.db`。如需重置数据库，删除该文件并重启服务即可。

## 开源协议

[MIT](LICENSE)

## 参与贡献

欢迎提交 Issue 和 Pull Request！
