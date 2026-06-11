<!-- From: /Users/luis/Workspace/open-cowork/AGENTS.md -->

# Open Cowork — Agent Guide

> Open Cowork is a secure AI coworking desktop application for government and controlled environments. It supports private AI models, private skill repositories, and full environment control with VM-level sandbox isolation (WSL2 on Windows, Lima on macOS), a built-in Skills system for generating documents, MCP integration, GUI automation, and remote control through Feishu (Lark) and Slack.

---

## Project Overview

| Property       | Value                                                   |
| -------------- | ------------------------------------------------------- |
| **Name**       | `open-cowork`                                           |
| **Version**    | `3.3.1`                                                 |
| **License**    | MIT                                                     |
| **Runtime**    | Electron 41 + Node.js 22 + React 18                     |
| **Language**   | TypeScript (strict mode)                                |
| **Platforms**  | Windows (x64), macOS (arm64), Linux (x64, source build) |
| **Repository** | `https://github.com/OpenCoworkAI/open-cowork`           |

### Architecture

The app follows the standard **Electron three-process model**:

- **Main Process** (`src/main/`) — Node.js backend. Handles AI execution, sandboxing, MCP servers, sessions, database, remote control, and all IPC handlers.
- **Renderer Process** (`src/renderer/`) — React 18 frontend. Chat UI, settings, trace panels, sidebar.
- **Preload Script** (`src/preload/`) — Secure `contextBridge` exposing a typed `window.electronAPI` to the renderer.

Build orchestration is done by **Vite** (`vite.config.ts`) with `vite-plugin-electron`, which bundles the main and preload entries alongside the renderer. Packaging is done by **electron-builder** (`electron-builder.yml`).

---

## Directory Structure

```
open-cowork/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── index.ts             # Main entry point (~2.8k lines, IPC hub, app lifecycle)
│   │   ├── claude/              # AI agent execution (agent-runner, model resolution, auth)
│   │   ├── config/              # Settings, API keys, config sets, diagnostics, Ollama
│   │   ├── db/                  # SQLite schema and data access (better-sqlite3)
│   │   ├── extensions/          # Agent runtime extension manager
│   │   ├── mcp/                 # MCP server lifecycle (stdio / SSE / Streamable HTTP)
│   │   ├── memory/              # Core + experience memory, ingestion, retrieval, LLM client
│   │   ├── remote/              # Feishu/Lark and Slack bot integration, tunneling
│   │   ├── sandbox/             # WSL2 (Windows) / Lima (macOS) / native executor
│   │   │   ├── wsl-agent/       # TypeScript agent compiled for WSL
│   │   │   └── lima-agent/      # TypeScript agent compiled for Lima
│   │   ├── schedule/            # Cron-like scheduled tasks
│   │   ├── session/             # Session CRUD, chat history, title generation
│   │   ├── skills/              # Skills manager, plugin catalog, plugin runtime
│   │   ├── tools/               # Tool execution dispatch and sandboxed executor
│   │   └── utils/               # Logger, path utilities, retry logic, etc.
│   ├── preload/                 # Electron preload script (contextBridge)
│   ├── renderer/                # React frontend
│   │   ├── components/          # UI components (ChatView, SettingsPanel, MessageCard, ...)
│   │   ├── hooks/               # Custom React hooks (useIPC, useApiConfigState, ...)
│   │   ├── i18n/                # i18next config and locale files (en, zh)
│   │   ├── store/               # Zustand state management
│   │   ├── styles/              # Tailwind + global CSS
│   │   ├── types/               # Shared renderer types
│   │   └── utils/               # Renderer utilities
│   ├── shared/                  # Code shared between main and renderer
│   │   ├── ipc-types.ts         # IPC type definitions
│   │   ├── api-model-presets.ts # Provider model presets
│   │   └── ...
│   └── tests/                   # Co-located tests mirroring src/main structure
├── tests/                       # Root-level tests (also picked up by Vitest)
├── scripts/                     # Build and packaging scripts
│   ├── bundle-mcp.js            # Bundles MCP servers with esbuild (all deps inlined)
│   ├── download-node.js         # Downloads platform-specific Node binaries
│   ├── prepare-python.js        # Prepares bundled Python runtime for GUI automation
│   ├── prepare-gui-tools.js     # Prepares platform GUI helper tools
│   ├── pre-build-check.js       # Validates build artifacts before packaging
│   ├── after-pack.js            # electron-builder afterPack hook
│   └── ...
├── .claude/skills/              # Built-in skills shipped with the app
│   ├── docx/                    # Word document generation
│   ├── pdf/                     # PDF handling and forms
│   ├── pptx/                    # PowerPoint generation
│   ├── xlsx/                    # Excel spreadsheet support
│   └── skill-creator/           # Toolkit for creating custom skills
├── resources/                   # Static assets, icons, bundled runtimes
├── website/                     # VitePress documentation site
└── patches/                     # patch-package patches
```

---

## Technology Stack

### Core

- **Electron** `^41.7.1` — desktop shell
- **Node.js** `>=22` — runtime (enforced by `engines` and CI)
- **TypeScript** `^5.3.3` — strict mode, no implicit `any`
- **Vite** `^7.3.1` + `vite-plugin-electron` — dev server and bundler

### Frontend

- **React** `^18.3.1` — functional components with hooks only
- **Tailwind CSS** `^3.4.16` — all styling; no CSS modules
- **Zustand** `^5.0.12` — state management
- **i18next** + **react-i18next** — internationalization (English + Chinese)
- **lucide-react** — icons (sole icon library)
- **react-markdown** + **KaTeX** + **highlight.js** — markdown rendering

### Backend / Main Process

- **better-sqlite3** `^12.8.0` — SQLite database
- **electron-store** `^11.0.2` — persistent settings
- **electron-updater** `^6.3.0` — auto-updater
- **@anthropic-ai/sdk** — Claude API
- **openai** — OpenAI-compatible APIs
- **@google/genai** — Gemini API
- **@modelcontextprotocol/sdk** — MCP client
- **@mariozechner/pi-coding-agent** + **@mariozechner/pi-ai** — core AI execution SDK
- **ws** — WebSocket server for remote control
- **ngrok** — tunneling for remote webhooks
- **@slack/bolt** + **@slack/web-api** — Slack integration
- **@larksuiteoapi/node-sdk** — Feishu (Lark) integration
- **archiver** — archive creation
- **chokidar** — file watching
- **uuid** — UUID generation

### Dev / Tooling

- **Vitest** `^4.1.0` — unit tests + benchmarks
- **ESLint** `^8.56.0` + **@typescript-eslint** + **eslint-plugin-react-hooks**
- **Prettier** `^3.8.3` — code formatting
- **Husky** `^9.1.7` + **lint-staged** — git hooks
- **@commitlint/cli** — conventional commit enforcement
- **patch-package** — runtime dependency patches

---

## Build and Test Commands

All commands are run via `npm`:

| Command                   | Purpose                                                                                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm install`             | Install deps; postinstall applies patches, downloads Node binaries, rebuilds native modules                                                     |
| `npm run dev`             | Start dev server (downloads Node, builds WSL/Lima agents, bundles MCP, then Vite + Electron)                                                    |
| `npm run dev:with-python` | Same as `dev` but also prepares bundled Python runtime                                                                                          |
| `npm run build`           | Full production build: downloads Node, prepares GUI tools + Python, builds agents + MCP, `tsc`, Vite build, pre-build check, `electron-builder` |
| `npm run build:win`       | Windows-specific build via `scripts/build-windows.js`                                                                                           |
| `npm run lint`            | ESLint over `src/**/*.{ts,tsx}`                                                                                                                 |
| `npm run format`          | Prettier write over `src/**/*.{ts,tsx,css}`                                                                                                     |
| `npm run typecheck`       | `tsc --noEmit`                                                                                                                                  |
| `npm run test`            | Run Vitest in watch mode                                                                                                                        |
| `npx vitest run`          | Run Vitest once (CI mode)                                                                                                                       |
| `npm run test:coverage`   | Run tests with v8 coverage report (enforces thresholds)                                                                                         |
| `npm run bench`           | Run Vitest benchmarks                                                                                                                           |
| `npm run clean`           | Remove all build artifacts (`dist`, `dist-electron`, `dist-mcp`, `dist-wsl-agent`, `dist-lima-agent`, `.bundle-resources`, `release`)           |
| `npm run rebuild`         | Rebuild `better-sqlite3` for current Electron version                                                                                           |

### CI Pipeline

The `.github/workflows/ci.yml` runs on every push/PR to `main` or `dev`:

1. `npm ci --ignore-scripts`
2. `npx patch-package`
3. `npm audit --audit-level=critical --omit=dev`
4. `npm rebuild better-sqlite3`
5. `npm run lint`
6. `npx tsc --noEmit`
7. `npm run test:coverage`
8. Upload coverage artifact

---

## Code Style Guidelines

- **TypeScript strict mode** — no implicit `any`. Use `unknown` + type guards instead of `any`.
- **ESLint + Prettier** — 2-space indent, single quotes, semicolons, trailing commas (ES5), print width 100.
- **React functional components only** — hooks, no class components.
- **Tailwind CSS for all styling** — no CSS modules, no inline style objects unless unavoidable.
- **Icons** — use `lucide-react` only; do not add other icon libraries.
- **Single component file limit** — keep individual component files under 500 lines; split large components.
- **i18n** — all user-visible strings must go through `i18next`/`useTranslation()`. Never hard-code display text. Add keys to both `en` and `zh` locales.

### Import Aliases

```ts
// Vite + TypeScript path aliases
@/           → src/
@main/       → src/main/
@renderer/   → src/renderer/
```

---

## Testing Instructions

- **Framework**: Vitest with `globals: true`, `environment: 'node'`.
- **File placement**: place tests next to source (`src/**/*.{test,spec}.ts`) or under `tests/` at the root with a mirrored path.
- **Electron mock**: Vitest resolves `electron` to `tests/mocks/electron.ts` so tests don't depend on the postinstall-generated `path.txt`.
- **Coverage**: provider `v8`. Thresholds are enforced in CI:
  - lines: 30%
  - functions: 35%
  - branches: 28%
  - statements: 30%
- Excluded from coverage: `node_modules`, `dist`, `dist-electron`, `src/renderer/`, `src/tests/`, `tests/`, `**/*.d.ts`, `**/*.config.*`, `**/mockData`.

### Writing Tests

- Use `mockReset: true` and `restoreMocks: true` (configured globally).
- For Electron-main code, mock `electron` imports via the built-in mock.
- For store modules, `electron-store` is inlined so it works in tests.

---

## Git Workflow

### Branches

| Branch           | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `main`           | Stable releases                          |
| `dev`            | Integration branch (target for most PRs) |
| `feature/<name>` | New features                             |
| `fix/<name>`     | Bug fixes                                |

### Commits

**Conventional Commits** are enforced by `commitlint` + `husky` on every commit.

```
<type>(<scope>): <short summary>
```

Allowed types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `chore`, `ci`, `style`, `revert`, `release`, `merge`

Header max length: **100 characters**

Examples:

```
feat(mcp): add Streamable HTTP transport support
fix(sandbox): handle WSL2 path with spaces
docs: update README setup instructions
test(session): add unit tests for session-manager
```

### PR Requirements

1. Target `dev` for all feature/fix PRs; target `main` only for releases.
2. Tests are required for every `feat` and `fix` PR.
3. Keep individual component files under 500 lines.
4. No `any` — use `unknown` + type guards.
5. CI must be green: lint, type-check, and tests.
6. Keep changes minimal and focused.

---

## Key Subsystems

### Sandbox Isolation

Multi-level sandbox protection:

| Level    | Platform | Technology                                                                |
| -------- | -------- | ------------------------------------------------------------------------- |
| Basic    | All      | Path Guard — file operations restricted to workspace folder               |
| Enhanced | Windows  | WSL2 — commands execute in isolated Linux VM                              |
| Enhanced | macOS    | Lima — commands execute in isolated Ubuntu VM (`claude-sandbox` instance) |

If no VM is available, commands fall back to native execution with path-based restrictions.

### MCP (Model Context Protocol)

- `src/main/mcp/mcp-manager.ts` — manages MCP server lifecycle (stdio, SSE, Streamable HTTP transports).
- `scripts/bundle-mcp.js` — bundles MCP server implementations with esbuild (all deps inlined) into `.bundle-resources/mcp/`.
- MCP servers are distributed as `extraResources` per platform in `electron-builder.yml`.

### Skills System

- Default skills live in `.claude/skills/` (docx, pdf, pptx, xlsx, skill-creator).
- `src/main/skills/skills-manager.ts` — discovery, hot-reload, install/uninstall.
- `src/main/skills/plugin-runtime-service.ts` — runtime execution of skill plugins.
- `src/main/skills/plugin-catalog-service.ts` — catalog of installable plugins.
- Skills are extracted via `extraResources` to avoid asar symlink issues.

### Memory System

- `src/main/memory/memory-service.ts` — orchestrates core memory and experience memory.
- **Core Memory**: high-importance facts extracted from sessions, stored per workspace.
- **Experience Memory**: chunked transcripts with embeddings for semantic retrieval.
- **Memory LLM Client**: talks to the configured AI model for extraction and summarization.
- **Ingestion Queue**: batched, debounced ingestion of session messages into memory.

### Remote Control

- `src/main/remote/remote-manager.ts` — gateway server, pairing, message routing.
- Supports **Feishu (Lark)** and **Slack** channels.
- Uses **ngrok** for public tunneling when no static URL is available.
- Users must approve pairings before remote commands are accepted.

### Scheduled Tasks

- `src/main/schedule/scheduled-task-manager.ts` — cron-like scheduler.
- `src/main/schedule/scheduled-task-store.ts` — persistent task storage.
- Tasks can run AI sessions on a schedule and store results.

---

## Security Considerations

- **Path containment** (`src/main/tools/path-containment.ts`) — all file operations must be within the user-selected workspace.
- **Preload allowlist** (`src/preload/index.ts`) — only explicitly allowed `ClientEvent` types can be sent over IPC.
- **Sandbox execution** — shell commands are routed through `sandbox-tool-executor.ts` which delegates to WSL, Lima, or the native executor with path guards.
- **Command injection tests** exist (`tests/sandbox-command-injection.test.ts`) to validate sanitization.
- **No `any` policy** — strict TypeScript reduces runtime type surprises.
- **External link sanitization** — `mailto:` URLs are sanitized in the preload to strip `attach`/`attachment` query params.
- **Renderer diagnostics** — console errors and unhandled rejections in the renderer are forwarded to the main-process log system with deduplication.

---

## Deployment

- **macOS**: `.dmg` via `electron-builder`. Homebrew tap: `OpenCoworkAI/tap`.
- **Windows**: `.exe` installer via NSIS.
- **Linux**: `.AppImage` (x64).
- Auto-updater uses `electron-updater` with GitHub releases (`OpenCoworkAI/open-cowork`).
- DMG size is set to `3g` to avoid build-time "No space left on device" errors; ULMO compression further shrinks the final artifact.

---

## Adding Dependencies

Before adding a dependency:

1. **Check license** — must be MIT, Apache-2.0, BSD, or ISC. No GPL/AGPL/SSPL.
2. **Check size** — run `npx pkg-size <package>` or check bundlephobia. Avoid bloating the installer.
3. **Check maintenance** — prefer packages with recent commits, multiple maintainers, and >1K weekly downloads.
4. **Prefer built-in** — use Node.js built-ins or existing dependencies before adding new ones.
5. **Document why** — explain in the PR description why the dependency is needed and what alternatives were considered.

Critical dependencies (always manual review before update):

- `electron`
- `@mariozechner/pi-coding-agent`
- `better-sqlite3`
- `vite` / `@vitejs/plugin-react`

---

## Useful Notes for Agents

- The main process entry point (`src/main/index.ts`) is a large file (~2.8k lines) that centralizes ~60 IPC handlers. When adding a new IPC channel, add the handler there and expose it in `src/preload/index.ts`.
- The renderer does **not** use React StrictMode (removed to prevent double-rendering issues with IPC).
- `vite.config.ts` externalizes many main-process dependencies in the Rollup build. ESM-only packages (`@mariozechner/pi-coding-agent`, `pi-ai`, `electron-store`, `uuid`) must **stay bundled** because CJS `require()` cannot load them.
- `patch-package` is used to maintain patches on dependencies (e.g., `@mariozechner+pi-ai+0.60.0.patch`). Run `npx patch-package` after `npm ci --ignore-scripts` in CI.
- Native modules (`better-sqlite3`, `bufferutil`, `utf-8-validate`, `@img`) are unpacked from asar via `asarUnpack` in `electron-builder.yml`.
- The app bundles its own Node.js runtime (downloaded by `scripts/download-node.js`) and platform-specific Python runtime for GUI automation helpers.
