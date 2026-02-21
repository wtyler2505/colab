# co(lab) Project Essentials

## What Is This

co(lab) is a hybrid browser + code editor desktop application for deep work. It combines a Monaco-based code editor, embedded Chromium browser tabs, terminal emulation, git integration, local LLM inference, and a plugin system into a single workspace-oriented desktop app.

- **Version**: 0.14.7
- **License**: MIT
- **Author**: Blackboard Technologies Inc.
- **Repository**: https://github.com/blackboardsh/colab
- **App Identifier**: `sh.blackboard.colab`
- **Main Branch**: `main`

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Desktop Framework | **Electrobun** (1.13.1-beta.0) | Native macOS app with CEF/Chromium + Bun runtime |
| Runtime | **Bun** | JavaScript/TypeScript runtime (bundled with app) |
| UI Framework | **SolidJS** (1.7.5+) | Reactive UI with fine-grained reactivity |
| Code Editor | **Monaco Editor** (0.52.0) | VS Code's editor component |
| Terminal | **xterm.js** (5.5.0+) | Terminal emulator with WebGL renderer, fit, search, web-links addons |
| Styling | **TailwindCSS** (3.4.3+) | Utility-first CSS |
| Build Tool | **esbuild** | Bundles renderer code (with Monaco worker + SolidJS plugins) |
| Database | **GoldfishDB** (0.1.3) | Embedded JSON database with schema versioning |
| Git | **simple-git** (3.22.0+) | Git operations wrapper (vendored git binary) |
| PTY | **Zig** | Native pseudo-terminal implementation |
| LLM | **llama.cpp** (via Zig build) | Local AI inference with GGUF models |
| Language | **TypeScript** (5.4.5+) | Strict mode, bundler resolution |
| Analytics | **Mixpanel** (0.18.0) | Opt-in usage analytics |

## Project Structure

```
colab/
  electrobun.config.ts        # Electrobun build configuration
  package.json                # Dependencies and scripts
  tsconfig.json               # TypeScript configuration
  src/
    bun/index.ts              # Bun-specific entry shim
    main/                     # Main process (Bun)
      index.ts                # App entry point (~3000 lines, RPC handlers)
      newapi.ts               # Path resolution utilities
      workspaceWindows.ts     # Window tracking and message broadcasting
      FileWatcher.ts          # Recursive fs.watch on project directories
      consts/
        paths.ts              # All filesystem path constants
      goldfishdb/
        db.ts                 # Database initialization (schema v7)
        schema/               # Schema migration history (v1-v7)
      peerDependencies/       # Peer dependency installers
        biome.ts, bun.ts, git.ts, node.ts, typescript.ts
      plugins/
        index.ts              # Plugin exports
        pluginManager.ts      # Plugin lifecycle (~2200 lines)
        pluginWorker.ts       # Isolated worker runtime
        npmRegistry.ts        # npm search integration
        types.ts              # Plugin API types (~1200 lines)
      utils/
        analytics.ts          # Mixpanel tracking
        fileUtils.ts          # File operations (uses vendored fd/rg)
        formatUtils.ts        # Biome code formatting
        gitUtils.ts           # Comprehensive git operations
        processUtils.ts       # Child process spawning
        sandbox.ts            # Plugin sandboxing
        terminalManager.ts    # Terminal session management
        tsServerUtils.ts      # TypeScript language server
        urlUtils.ts           # Favicon fetching
    pty/                      # Native PTY (Zig)
      build.zig               # Zig build script
      main.zig                # PTY implementation
    renderers/
      components/
        ColabTerminal.ts      # Web component for terminal
      ivde/                   # Main IDE renderer
        index.tsx             # SolidJS app root (~4200 lines)
        index.html            # HTML shell
        index.css             # Base styles
        init.ts               # Electroview RPC + message handlers
        rpc.ts                # Typed RPC schema definition
        store.tsx             # SolidJS store (AppState, ~1300 lines)
        files.ts              # File/slate utilities
        FileTree.tsx          # File tree component
        FileWatcher.ts        # Renderer-side file cache
        CodeEditor.tsx        # Monaco editor wrapper
        DiffEditor.tsx        # Monaco diff editor
        analytics.ts          # Frontend analytics
        components/           # UI components
          TopBar.tsx, StatusBar.tsx, Dialog.tsx,
          GitHubRepoSelector.tsx, GitHubStatus.tsx,
          BlackboardAnimation.tsx
        slates/               # Custom tab content types
          WebSlate.tsx         # Browser tab
          TerminalSlate.tsx    # Terminal tab
          GitSlate.tsx         # Git operations tab
          AgentSlate.tsx       # LLM chat tab
          PluginSlate.tsx      # Plugin-rendered tab
          pluginSlateRegistry.tsx
        settings/             # Settings panels
          LlamaSettings.tsx, GitHubSettings.tsx,
          ColabCloudSettings.tsx, PluginMarketplace.tsx,
          PluginSettings.tsx, forms.tsx
        services/             # Frontend services
          aiCompletionService.ts, githubService.ts,
          settingsSyncService.ts, settingsSyncEncryption.ts
        styles/
          blackboard.css
      utils/                  # Renderer utilities
        fileUtils.ts, pathUtils.ts
      tailwind.config.js      # Tailwind configuration
    shared/                   # Code shared between main and renderer
      types/
        types.ts              # Shared type definitions
      utils/
        files.ts              # Shared file utilities
  llama-cli/                  # Zig-based llama.cpp build
    build.zig, setup-llama.sh, src/, deps/
  webflow-plugin/             # Webflow Designer extension (example plugin)
  vendor/                     # Vendored binaries (fd, rg, git)
  vendors/                    # Vendored build tools (cmake, zig)
  scripts/
    postBuild.ts              # Post-build processing
    setup-deps.ts             # Dependency setup
    upload-artifacts.ts       # Release artifact upload
  assets/                     # App icons, file icons, licenses
  documentation/              # Project documentation site
  test-plugin/                # Example plugin for testing
```

## Build Commands

```bash
# Initial setup (installs Zig, llama.cpp, PTY dependencies)
bun run setup

# Full dev build + launch
bun run dev

# Build only (dev environment)
bun run build:dev

# Start dev server (after build)
bun run start:dev

# Build for canary channel
bun run build:canary

# Build for stable channel
bun run build:stable

# Version bumping and release
bun run push:canary     # Prerelease bump + push
bun run push:patch      # Patch version bump + push
bun run push:minor      # Minor version bump + push
bun run push:major      # Major version bump + push
bun run push:stable     # Stable patch bump + push

# Documentation
bun run docs:dev        # Dev server for docs
bun run docs:build      # Build docs
bun run docs:serve      # Serve built docs
```

## TypeScript Configuration

From `tsconfig.json` -- strict configuration with modern ES targets:

- **Target**: ESNext
- **Module**: ESNext with bundler resolution
- **JSX**: Preserve with `solid-js` import source
- **Strict mode**: Enabled
- **`noUnusedLocals`**: true
- **`noUnusedParameters`**: true
- **`noFallthroughCasesInSwitch`**: true
- **`noPropertyAccessFromIndexSignature`**: true
- **`verbatimModuleSyntax`**: true
- **`noEmit`**: true (bundler handles output)
- **`skipLibCheck`**: true
- **`allowJs`**: true

## Key Conventions

### State Management
- SolidJS `createStore` for global state with `produce` for mutations
- State producers are exported functions from `store.tsx` -- never mutate state directly
- `updateSyncedState()` persists workspace state to GoldfishDB via RPC
- Ephemeral UI state (drag, resize) lives in the store but is not persisted

### RPC Communication
- Fully typed RPC schema defined in `src/renderers/ivde/rpc.ts`
- Main process defines handlers in `index.ts` via `BrowserView.defineRPC`
- Renderer defines handlers in `init.ts` via `Electroview.defineRPC`
- Request/response pattern for queries, fire-and-forget messages for events

### File System
- All paths are absolute
- `~/.colab/` (or `~/.colab-{channel}/`) is the app home directory
- Projects are referenced by path, not copied into the app
- File tree is lazily loaded -- nodes are cached in `fileCache` on demand
- File watching is recursive per-project via `fs.watch()`

### Vendored Binaries
- The app bundles its own `bun`, `git`, `fd`, `rg`, and `llama-cli`
- No dependency on system-installed versions
- Peer dependencies (TypeScript, Biome) are installed into `~/.colab/.bun/node_modules/`

### Plugin System
- Plugins are npm packages with `"colab-plugin"` in `package.json`
- Installed to `~/.colab/plugins/` with registry at `registry.json`
- Run in Bun Worker threads
- Plugin API provides: commands, completions, terminal commands, status bar, file decorations, context menus, keybindings, custom slates, settings schemas, shell execution
- Entitlements are declared but NOT enforced -- trust-based model

### Tab Types
- `file` - Code editor (Monaco) or slate UI for special folders
- `web` - Embedded CEF browser with independent session/partition
- `terminal` - xterm.js terminal backed by PTY
- `agent` - LLM chat using local llama.cpp models

### Workspace Model
- Workspaces contain projects (by reference) and window configurations
- Each window has a pane layout tree (recursive container/pane structure)
- Each pane has tabs, a current tab, and tab ordering
- Windows track folder expansion state independently
- Multiple windows can be open for the same workspace

### Git Integration
- Uses vendored git binary with `simple-git` library
- Line-level staging integrated with Monaco diff editor
- GitHub credential management via macOS keychain
- Branch management, stash, remote operations all available in-app

### Code Style
- No semicolons (implicit ASI)
- Tabs for indentation in most files
- `TODO`/`XXX`/`YYY`/`ZZZ` comment conventions for different priority levels
- Biome for formatting
- SolidJS JSX patterns (no React)
