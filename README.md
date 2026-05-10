# Dict-App

An open-source i18n translation management tool with LLM-powered automated translation. Upload locale files via CLI, manage translations in a web admin panel, trigger AI-powered batch translation, and download results back to your project — all in one workflow.

[中文文档](README.zh-CN.md)

## Features

- **CLI Tool** — `dictapp upload` and `dictapp download` to sync locale files with the server
- **Web Admin Panel** — Manage translation keys, trigger AI translation tasks, and review results
- **Multi-Provider LLM Support** — OpenAI, Anthropic Claude, DeepSeek, and any OpenAI-compatible endpoint
- **Placeholder Preservation** — Automatically preserves `{variable}`, `%s`, `{{interpolation}}`, ICU format, and HTML tags
- **Nested JSON Support** — Deeply nested locale files are automatically flattened for translation and restored on download
- **Task Queue** — Background translation with progress tracking, auto-refresh, and retry on failure
- **Lightweight** — SQLite database, zero external dependencies beyond Python and Node.js

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   CLI (dictapp)  │────▶│  Flask Server     │◀────│  Web Admin      │
│   Node.js / npm  │     │  Python / SQLite  │     │  React / Antd   │
│                  │◀────│                   │     │                 │
└─────────────────┘     └────────┬──────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │   LLM Providers  │
                        │  OpenAI/Claude/  │
                        │  DeepSeek/Compat │
                        └──────────────────┘
```

## Quick Start

### Prerequisites

- **Node.js** >= 18 (recommend 22+)
- **Python** >= 3.9
- **npm** >= 9

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/dict-app.git
cd dict-app

# Install CLI and web dependencies
npm install

# Set up Python server
cd server
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. Start the Server

```bash
cd server
source venv/bin/activate
python app.py
# Server running at http://localhost:5050
```

### 3. Start the Web Admin

```bash
# In a new terminal, from project root
cd web
npx vite
# Web admin at http://localhost:3000
```

### 4. Set Up a Project

1. Open `http://localhost:3000` in your browser
2. Click **Create Project** and give it a name
3. Copy the **Project ID** and **API Key** from the table

### 5. Configure Your Frontend Project

Add a `dictapp` section to your frontend project's `package.json`:

```json
{
  "name": "my-frontend-app",
  "dictapp": {
    "projectId": "a1b2c3d4e5f6",
    "apiKey": "your-api-key-here",
    "serverUrl": "http://localhost:5050",
    "localeDir": "locale"
  }
}
```

### 6. Upload Locale Files

```bash
# In your frontend project directory
dictapp upload         # if installed globally (npm install -g dictapp)
# or:
npx dictapp upload     # if installed locally (npm install --save-dev dictapp)
# shorthand: dictapp -u
```

### 7. Configure LLM and Translate

1. In the web admin, navigate to your project → **LLM Config**
2. Select your provider (e.g., OpenAI), enter the model name and API key
3. Click **Test Connection** to verify
4. Go to **Translation Tasks** → **New Task**
5. Select source language and target languages
6. Click **Start Translation**

### 8. Download Translations

```bash
# In your frontend project directory
dictapp download       # if installed globally (npm install -g dictapp)
# or:
npx dictapp download   # if installed locally (npm install --save-dev dictapp)
# shorthand: dictapp -d
```

Your locale files will be updated with the translated content.

## CLI Reference

### `dictapp upload` (alias: `dictapp -u`)

Scans the configured `localeDir` for `.json` files, flattens nested structures, and uploads all key-value pairs to the server.

```bash
dictapp upload           # global install
npx dictapp upload       # local install
# Output:
# Uploaded en_US.json (42 keys)
# Uploaded zh_CN.json (42 keys)
# Done. Uploaded 2 locale file(s).
```

### `dictapp download` (alias: `dictapp -d`)

Downloads all completed translations from the server and writes them as locale files, restoring nested JSON structure.

```bash
dictapp download         # global install
npx dictapp download     # local install
# Output:
# Downloaded en_US.json (42 keys)
# Downloaded ja_JP.json (42 keys)
# Done. Downloaded 2 locale file(s).
```

### Configuration

All configuration lives in your project's `package.json` under the `dictapp` key:

| Field | Required | Description |
|-------|----------|-------------|
| `projectId` | Yes | Project ID from the web admin |
| `apiKey` | Yes | API key from the web admin |
| `serverUrl` | Yes | Server URL (e.g., `http://localhost:5050`) |
| `localeDir` | Yes | Relative path to your locale files directory |

### Supported Locale File Formats

Files must be `.json` with locale code as the filename (e.g., `zh_CN.json`, `en_US.json`). Both flat and nested structures are supported:

```json
// Flat
{ "nav.home": "Home", "nav.about": "About" }

// Nested (auto-flattened to dot-notation on upload)
{
  "nav": { "home": "Home", "about": "About" },
  "user": { "greeting": "Hello, {name}" }
}
```

## Web Admin

### Pages

| Page | Description |
|------|-------------|
| **Projects** | Create, list, and delete projects. Copy Project ID and API Key. |
| **Locales** | Browse translation keys by language. Search, inline edit, and delete entries. |
| **Translation Tasks** | Create batch translation tasks. Monitor progress with auto-refresh. |
| **Task Detail** | View individual translation status. Manually correct translations. Retry failures. |
| **LLM Config** | Configure AI provider, model, and API key. Test connection. |

### Supported LLM Providers

| Provider | Model Examples |
|----------|---------------|
| **OpenAI** | gpt-4.1, gpt-4o, gpt-4-turbo |
| **Anthropic Claude** | claude-sonnet-4-6, claude-opus-4-7 |
| **DeepSeek** | deepseek-chat, deepseek-reasoner |
| **OpenAI Compatible** | Any endpoint with OpenAI-compatible API |

## API Reference

Base URL: `http://localhost:5050/api/v1`

### Authentication

CLI and web admin requests require two headers:
- `X-Project-Id` — Project ID
- `X-API-Key` — Project API key

### CLI Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/upload` | Upload locale entries |
| `GET` | `/download` | Download completed translations |

### Project Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects` | List all projects |
| `POST` | `/projects` | Create a project |
| `GET` | `/projects/:id` | Get project details |
| `DELETE` | `/projects/:id` | Delete a project |

### Locale Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:id/locales` | List available locales |
| `GET` | `/projects/:id/entries` | Paginated entries list |
| `PUT` | `/projects/:id/entries/:eid` | Update entry value |
| `DELETE` | `/projects/:id/entries/:eid` | Delete entry |

### Translation Task Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:id/tasks` | List tasks |
| `POST` | `/projects/:id/tasks` | Create translation task |
| `GET` | `/projects/:id/tasks/:tid` | Get task detail |
| `POST` | `/projects/:id/tasks/:tid/retry` | Retry failed translations |
| `GET` | `/projects/:id/translations` | List translations |
| `PUT` | `/projects/:id/translations/:tid` | Update translation value |

### LLM Config Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:id/llm-config` | Get LLM configuration |
| `PUT` | `/projects/:id/llm-config` | Save LLM configuration |
| `POST` | `/projects/:id/llm-config/test` | Test LLM connection |

## Project Structure

```
dict-app/
├── cli/                              # NPM CLI package (dictapp)
│   ├── package.json
│   ├── bin/dictapp.js                # Entry point
│   └── src/
│       ├── config.js                 # Read package.json configuration
│       ├── upload.js                 # Upload locale files to server
│       ├── download.js               # Download translations from server
│       ├── api.js                    # HTTP client with retry logic
│       └── flat.js                   # Nested JSON <-> dot-notation conversion
│
├── server/                           # Python Flask backend
│   ├── requirements.txt
│   ├── app.py                        # Flask application factory
│   ├── config.py                     # Server configuration
│   ├── db.py                         # SQLAlchemy + SQLite setup
│   ├── models/                       # Database models
│   │   ├── project.py
│   │   ├── source_entry.py
│   │   ├── translation.py
│   │   ├── translation_task.py
│   │   └── llm_config.py
│   ├── api/                          # REST API routes
│   │   ├── cli_routes.py
│   │   ├── project_routes.py
│   │   ├── locale_routes.py
│   │   ├── task_routes.py
│   │   └── llm_config_routes.py
│   ├── services/                     # Business logic
│   │   ├── auth.py                   # API key authentication
│   │   ├── locale_service.py         # Upload/download logic
│   │   └── translation_service.py    # Translation orchestration
│   ├── llm/                          # LLM provider abstraction
│   │   ├── base.py                   # Abstract base class
│   │   ├── openai_provider.py
│   │   ├── anthropic_provider.py
│   │   ├── deepseek_provider.py
│   │   ├── openai_compatible_provider.py
│   │   ├── factory.py                # Provider factory
│   │   └── utils.py                  # JSON response parsing
│   └── prompts/
│       └── translation.py            # Translation prompt templates
│
└── web/                              # React + Ant Design admin panel
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx                   # Router setup
        ├── api/client.js             # Axios client with auth
        ├── contexts/ProjectContext.jsx
        ├── components/
        │   ├── Layout.jsx            # Sidebar layout
        │   └── ProjectSelector.jsx
        └── pages/
            ├── ProjectList.jsx       # Project management
            ├── LocaleManager.jsx     # Translation key browser
            ├── TranslationTasks.jsx  # Task creation and monitoring
            ├── TaskDetail.jsx        # Per-translation review
            └── LLMConfig.jsx         # AI provider configuration
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| CLI | Node.js, Commander, Axios |
| Backend | Python 3, Flask, SQLAlchemy, SQLite |
| Frontend | React 19, Ant Design 5, React Router 7, Vite 6 |
| LLM SDKs | OpenAI Python SDK, Anthropic Python SDK |

## Development

### Environment Setup

```bash
# Node.js 22+
nvm use 22

# Install all dependencies
npm install
cd server && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
cd ..
```

### Start Development Servers

```bash
# Terminal 1: Flask server
cd server && source venv/bin/activate && python app.py

# Terminal 2: Web dev server (with hot reload)
cd web && npx vite
```

### Run CLI Locally

```bash
node cli/bin/dictapp.js upload
```

### Database

The server uses SQLite with the database file created automatically at `server/dictapp.db`. The schema is auto-created on first startup. To reset the database, delete the file and restart the server.

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.
