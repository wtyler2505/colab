# co(lab) System Architecture

## Overview

co(lab) is a hybrid browser + code editor desktop application built on **Electrobun** (a macOS-native desktop framework using CEF/Chromium + Bun). The architecture follows a classic **main process / renderer process** split, with the main process orchestrating system-level operations and the renderer providing a SolidJS-driven IDE interface.

## Process Architecture

```
+---------------------------+
|      Main Process         |
|   (Bun + Electrobun)      |
|                           |
|  - Window management      |
|  - File I/O & watchers    |
|  - Git operations         |
|  - Terminal (PTY) mgmt    |
|  - Plugin lifecycle       |
|  - GoldfishDB (local DB)  |
|  - Peer dependency mgmt   |
|  - Auto-updater           |
|  - Tray menu              |
|  - Application menu       |
|  - llama.cpp inference     |
+---------------------------+
        |  RPC (typed)
        v
+---------------------------+
|    Renderer Process       |
|  (SolidJS + Monaco +      |
|   xterm + TailwindCSS)    |
|                           |
|  - Pane/tab layout system |
|  - Code editor (Monaco)   |
|  - Terminal (xterm.js)    |
|  - Web browser (CEF)      |
|  - Git UI (diff/staging)  |
|  - File tree sidebar      |
|  - Settings panels        |
|  - Agent chat (LLM)       |
|  - Plugin slate rendering |
|  - Command palette        |
+---------------------------+
```

## Main Process (`src/main/`)

### Entry Point: `src/main/index.ts`

The main entry point (~3000 lines) bootstraps the entire application:

1. **Peer Dependency Installation** - Installs TypeScript and Biome into `~/.colab/.deps/` on startup via bundled Bun binary. Git, Bun, and llama-cli are vendored/bundled with the app.

2. **Plugin Activation** - Calls `pluginManager.activateAllEnabled()` to start all user-installed plugins, then wires plugin terminal commands and the built-in `edit` command into the terminal manager.

3. **Application Menu** - Defines native macOS menus (File, Edit, View, Tools, Settings, Help) with accelerators. Plugin keybindings are dynamically synced into the Tools menu every 5 seconds.

4. **Tray Menu** - System tray with workspace toggling, workspace creation, database reset, update management, and quit.

5. **Window Lifecycle** - `createWindow()` instantiates `BrowserWindow` instances tied to a workspace. Each window gets a typed RPC channel (`WorkspaceRPC`) connecting it to the renderer.

6. **RPC Handler Registration** - The bulk of `index.ts` registers RPC request handlers that the renderer calls: file I/O, git operations, terminal management, search (via vendored `rg` and `fd`), plugin commands, llama.cpp completions, and workspace/project CRUD.

7. **Global Event Handlers** - Listens for Electrobun events: download lifecycle (`download-started/progress/completed/failed`), context menu actions, and new-window-open.

### API Layer: `src/main/newapi.ts`

Minimal utility module providing `getAppPath()`, `getVersion()`, and `getPath(name)` for resolving system paths. Acts as a thin abstraction over Electrobun's resource path resolution.

### Window Management: `src/main/workspaceWindows.ts`

Manages ephemeral window state as a nested map: `workspaceWindows[workspaceId][windowId]`. Provides broadcasting utilities:

- `broadcastToAllWindows(type, data)` - Send to every open window
- `broadcastToAllWindowsInWorkspace(workspaceId, type, data)` - Send to all windows in a workspace
- `broadcastToWindow(workspaceId, windowId, type, data)` - Send to a specific window
- `sendToFocusedWindow(type, data)` - Send to the currently focused window (with broadcast fallback)
- `setFocusedWindow(workspaceId, windowId)` / `clearFocusedWindow(...)` - Track which window has focus

### Database: `src/main/goldfishdb/`

Uses **GoldfishDB** (a lightweight embedded JSON database with schema versioning). Currently at schema v7 with collections for:

- `workspaces` - Workspace configs (name, color, project IDs, window layouts)
- `projects` - Project references (name, path)
- `appSettings` - Global settings (analytics, llama config, GitHub credentials, Colab Cloud)

The database is stored at `~/.colab/.goldfishdb/goldfish.db` with a static passphrase for encryption. Schema migrations are defined as sequential schema objects (`schema1` through `schema7`).

### File Watcher: `src/main/FileWatcher.ts`

Uses Node's `fs.watch()` with `{ recursive: true }` on each project directory. On file change events, broadcasts `fileWatchEvent` messages to all windows in the relevant workspace, carrying: `absolutePath`, `exists`, `isDelete`, `isAdding`, `isFile`, `isDir`.

### Constants/Paths: `src/main/consts/paths.ts`

Defines all filesystem paths used by the application. The home folder is channel-dependent:

- Stable: `~/.colab/`
- Canary: `~/.colab-canary/`
- Dev: `~/.colab-dev/`

Key directories:
- `~/.colab/projects/` - Default project storage
- `~/.colab/.goldfishdb/` - Database
- `~/.colab/.deps/` - Peer dependencies (TypeScript, Biome)
- `~/.colab/.bun/` - Bundled Bun's node_modules
- `~/.colab/models/` - Local LLM models (GGUF format)
- `~/.colab/plugins/` - Installed plugins + registry.json

Bundled binaries (shipped with app): `bun`, `llama-cli`, `vendor/git`, `vendor/fd`, `vendor/rg`.

### Terminal Manager: `src/main/utils/terminalManager.ts`

Manages terminal sessions using Bun's `spawn()`. Each terminal is a `TerminalSession` with its own shell process. Supports:

- Creating terminals with configurable shell and CWD
- Writing to/reading from terminals
- Resizing terminals (cols/rows)
- Tracking CWD per terminal
- Plugin command interception (commands are checked against plugin handlers before being sent to the shell)
- Built-in `edit` command handler for opening files in the editor from the terminal

### PTY Layer: `src/pty/`

A **Zig** implementation (`main.zig`) providing native PTY (pseudo-terminal) support. Communicates via JSON messages over stdin/stdout with message types: `spawn`, `input`, `resize`, `shutdown`, `get_cwd`. This provides proper terminal emulation with window size control.

### Plugin System: `src/main/plugins/`

A full plugin framework enabling npm-installable extensions:

- **`pluginManager.ts`** (~2200 lines) - Core lifecycle management: install, uninstall, activate, deactivate. Plugins are npm packages with a `"colab-plugin"` field in `package.json`. They run as Bun Worker threads with a sandboxed API surface.

- **`types.ts`** (~1200 lines) - Comprehensive type definitions for the plugin API including: commands, keybindings, status bar items, file decorations, context menus, completions, terminal commands, custom slates, settings schemas, and an entitlements system (declared but not enforced).

- **`pluginWorker.ts`** - Worker thread runtime for isolated plugin execution.

- **`npmRegistry.ts`** - npm registry search integration for the plugin marketplace.

Plugin API capabilities include: file system access, editor integration, terminal commands, shell execution, git operations, status bar items, file tree decorations, context menus, keyboard shortcuts, custom slate UIs, and settings management.

### Utilities: `src/main/utils/`

- **`gitUtils.ts`** - Comprehensive git operations wrapper using `simple-git` library. Covers: status, diff, commit, branch, stash, remote, push/pull, line-level staging (Monaco-integrated), patch creation/application, GitHub credential management.
- **`fileUtils.ts`** - File operations: safe delete/trash, find files/content (using vendored `fd`/`rg`), unique name generation, slate config reading, devlink syncing.
- **`terminalManager.ts`** - Terminal session management (described above).
- **`processUtils.ts`** - `execSpawnSync` wrapper for spawning child processes.
- **`tsServerUtils.ts`** - TypeScript language server integration.
- **`formatUtils.ts`** - Code formatting via Biome.
- **`analytics.ts`** - Mixpanel-based analytics (opt-in).
- **`urlUtils.ts`** - Favicon fetching for web tabs.

## Renderer (`src/renderers/ivde/`)

### Entry Point: `src/renderers/ivde/index.tsx`

The main renderer (~4200 lines) bootstraps the SolidJS application:

1. **Initialization** - Calls `getInitialState()` via RPC to fetch workspace config, projects, settings, and peer dependency status from the main process.

2. **App Shell** - Renders: `<TopBar>` (tab bar) + `<Sidebar>` (file tree, find-all, open files) + workbench area (pane layout with tab content) + `<StatusBar>` + settings slide-over panel.

3. **Tab System** - Four tab types:
   - `FileTabType` - Code editor (Monaco) or slate UI
   - `WebTabType` - Embedded CEF browser with URL bar
   - `TerminalTabType` - xterm.js terminal
   - `AgentTabType` - LLM chat interface

4. **Keyboard Shortcuts** - Intercepts `keydown` at the document level for: `Cmd+Shift+F` (find all), `Cmd+Shift+P` (command palette), `Cmd+R` (refresh web tab), `Ctrl+Tab`/`Ctrl+Shift+Tab` (cycle tabs), plus plugin keybindings.

5. **Settings Panels** - Slide-in panels for: global settings, workspace settings, node settings (add/edit), llama settings, GitHub settings, Colab Cloud settings, plugin marketplace, plugin settings.

### RPC Definition: `src/renderers/ivde/rpc.ts`

Defines the complete typed RPC schema (`WorkspaceRPC`) as an Electrobun `RPCSchema`. Split into:

- **`bun` (requests)** - ~70+ request types from renderer to main: file I/O, git operations, terminal management, search, plugin operations, llama completions, workspace sync, settings sync.
- **`bun` (messages)** - ~15 fire-and-forget messages: directory watcher control, tsserver requests, window lifecycle, workspace CRUD, analytics tracking.
- **`webview` (messages)** - ~25+ messages from main to renderer: state init, file watch events, search results, tab/pane operations, download notifications, terminal output, plugin events.

### State Management: `src/renderers/ivde/store.tsx`

Uses **SolidJS `createStore`** for the entire application state (`AppState` interface, ~1300 lines). Key state slices:

- `workspace` - Current workspace config (windows, panes, tabs)
- `projects` - Project map by ID
- `fileCache` - Cached file/folder nodes by absolute path
- `slateCache` - Cached `.colab.json` configs
- `editors` - Monaco editor instances by editor ID
- `dragState` - Tab/node drag-and-drop state
- `findAllInFolder` - Search results
- `commandPalette` - Command palette / file search results
- `appSettings` - Llama, GitHub, Colab Cloud settings
- `pluginSlates` - Plugin-registered custom file handlers
- `downloadNotification` - Download progress state

State producers (mutation functions) are exported for: tab management (`openNewTab`, `openNewTabForNode`, `closeTab`, `focusTabWithId`), pane layout (`splitPane`, `getCurrentPane`, `walkPanes`), file tree (`setNodeExpanded`), settings panel, and project management.

State syncing: `updateSyncedState()` sends the workspace state to main process via `syncWorkspace` RPC for database persistence.

### Initialization: `src/renderers/ivde/init.ts`

Creates the `Electroview` instance with typed RPC handlers for all incoming messages from the main process. This is where the renderer-side RPC message handlers live: file watch events, search results, tab/pane operations, terminal output, download notifications, plugin slate rendering, global shortcut forwarding, and settings panel opening.

Also registers web components (`colab-terminal`) and initializes the plugin slate registry.

### Component Architecture

- **`CodeEditor.tsx`** - Monaco editor wrapper with TypeScript language server integration
- **`DiffEditor.tsx`** - Monaco diff editor for git changes
- **`FileTree.tsx`** - Project file tree with context menus, drag-and-drop, and find-all results
- **`FileWatcher.ts`** (renderer-side) - Client-side file cache management responding to main process events

**Components:**
- `TopBar.tsx` - Tab bar with drag-and-drop tab reordering
- `StatusBar.tsx` - Bottom status bar with plugin items
- `Dialog.tsx` - Confirmation dialogs
- `GitHubRepoSelector.tsx` - GitHub repository browser
- `GitHubStatus.tsx` - GitHub connection status display
- `BlackboardAnimation.tsx` - Loading/splash animation

**Slates** (custom tab UIs):
- `WebSlate.tsx` - Embedded web browser with URL bar, navigation, preload scripts
- `TerminalSlate.tsx` - xterm.js terminal emulator
- `GitSlate.tsx` - Git operations UI (status, diff, staging, commit, branch management)
- `AgentSlate.tsx` - LLM chat interface using local llama.cpp models
- `PluginSlate.tsx` - Dynamic UI rendered by plugins via HTML/script injection

**Settings:**
- `LlamaSettings.tsx` - Local LLM model management (install, remove, configure)
- `GitHubSettings.tsx` - GitHub PAT configuration
- `ColabCloudSettings.tsx` - Colab Cloud account settings
- `PluginMarketplace.tsx` - Plugin search, install, and management
- `PluginSettings.tsx` - Per-plugin settings panels

**Services:**
- `aiCompletionService.ts` - AI code completion integration
- `githubService.ts` - GitHub API client
- `settingsSyncService.ts` / `settingsSyncEncryption.ts` - Settings sync

## Shared Code (`src/shared/`)

### Types: `src/shared/types/types.ts`

Shared type definitions used by both main and renderer:

- `FileNodeType` / `FolderNodeType` / `CachedFileType` - File tree node types with Monaco model references, dirty state, binary detection, and partial loading support
- `SlateType` - Union type for folder configurations: `web` (browser profile), `project`, `agent` (LLM chat), `devlink`, `repo` (git clone)
- `ProjectType` - Project reference (id, name, path)
- `PreviewFileTreeType` - File tree nodes for settings panel previews
- `ParsedResponseType` - TypeScript server response union type
- Context menu and DOM event types

### Utilities: `src/shared/utils/files.ts`

Shared file utility functions (e.g., `makeFileNameSafe`).

## External Integrations

### llama.cpp (`llama-cli/`)

Zig-based build of llama.cpp for local LLM inference. The binary is bundled with the app at `LLAMA_CPP_BINARY_PATH`. Used for:

- AI code completion in the editor
- Agent chat conversations
- Model management (download GGUF models from Hugging Face)

### Webflow Plugin (`webflow-plugin/`)

A Webflow Designer extension built as a colab plugin, demonstrating the plugin system's capabilities.

### Vendored Binaries (`vendor/`)

Pre-built binaries for: `fd` (file finder), `rg` (ripgrep, content search), `git`. These ensure the app works without system-installed versions.

## Build System

Configured via `electrobun.config.ts`:

- **Entry point**: `src/main/index.ts` (Bun bundles this)
- **Views**: HTML/CSS/JS assets copied to the app bundle
- **Post-build**: `scripts/postBuild.ts` runs after Electrobun's build
- **Release**: Updates served from `https://colab-releases.blackboard.sh/`
- **Code signing**: macOS codesign + notarize enabled
- **CEF bundled**: Yes (`bundleCEF: true`)
- **Runtime**: `exitOnLastWindowClosed: false` (app stays in tray)

## Data Flow

### Window Creation
```
Main: createWorkspace() / createWindow()
  -> Insert workspace/window into GoldfishDB
  -> Create BrowserWindow with typed RPC
  -> Renderer: getInitialState() RPC call
  -> Main: returns workspace, projects, settings, paths
  -> Renderer: setState() initializes SolidJS store
  -> Renderer: loadPluginSlates() fetches plugin UIs
```

### File Edit
```
Renderer: User edits in Monaco editor
  -> Monaco model updated (local state)
  -> Cmd+S triggers writeFile RPC
  -> Main: fs.writeFileSync()
  -> Main: FileWatcher detects change
  -> Main: broadcasts fileWatchEvent to all windows
  -> Other Renderers: update their Monaco models
```

### Terminal Command
```
Renderer: User types in xterm.js
  -> writeToTerminal RPC
  -> Main: terminalManager.writeToTerminal()
  -> Check plugin commands first
  -> Check built-in commands (edit)
  -> Forward to shell process
  -> Shell output -> terminalOutput message -> Renderer
  -> Renderer: xterm.js writes output
```
