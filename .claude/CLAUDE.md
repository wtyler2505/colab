# co(lab) — Hybrid Browser + Code Editor

> Desktop app for deep work. Built with Electrobun + SolidJS + Monaco + xterm.
> Version 0.14.7 | MIT | github.com/blackboardsh/colab

## Quick Reference
@.claude/core/essential.md

## Architecture
@.claude/docs/architecture.md

## Available Tools
@.claude/core/tools-mcp.md
@.claude/core/tools-cli.md

## Performance Budgets
@.claude/core/performance.md

## Project Knowledge
@.claude/docs/testing.md
@.claude/docs/deployment.md

## Workflows
@.claude/workflows/development.md
@.claude/workflows/troubleshooting.md

## Key Commands
```bash
bun run dev          # Build + launch dev mode
bun run build:dev    # Build only
bun run start:dev    # Launch only
bun run build:canary # Canary release build
bun run build:stable # Stable release build
```

## Project Structure (Quick)
```
src/main/         # Main process (Bun + Electrobun)
src/renderers/    # UI (SolidJS + Monaco + xterm)
src/shared/       # Shared types & utils
src/pty/          # Terminal PTY (Zig)
webflow-plugin/   # Webflow Designer extension
llama-cli/        # Local LLM inference (Zig + llama.cpp)
vendor/           # Vendored macOS ARM binaries (fd, rg, git)
vendors/          # Build tools (cmake, zig)
scripts/          # Build & deploy scripts
```

## Conventions
- TypeScript strict mode (no unused locals/params)
- SolidJS JSX (`jsxImportSource: "solid-js"`)
- Bundler module resolution (use `.ts` extensions)
- `verbatimModuleSyntax` — use `import type` for types
- Main branch: `main`
- RPC-based main↔renderer communication
- GoldfishDB for local persistence (schema v7)
