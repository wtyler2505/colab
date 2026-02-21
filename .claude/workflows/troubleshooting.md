# Troubleshooting Guide

## Build Issues

### `bun run build:dev` fails
1. Check Bun version: `bun --version` (needs recent version)
2. Clean and reinstall: `rm -rf node_modules && bun install`
3. Run setup: `bun run setup`
4. Check Electrobun version matches package.json (currently 1.13.1-beta.0)

### esbuild errors
- SolidJS JSX needs `jsxImportSource: "solid-js"` in tsconfig
- Check esbuild-plugin-solid is installed
- Monaco editor plugin may need specific esbuild version

### TypeScript errors
- Strict mode is ON (`noUnusedLocals`, `noUnusedParameters`)
- Bundler module resolution — use `.ts` extensions in imports
- `verbatimModuleSyntax` — use `import type` for type-only imports

## Runtime Issues

### Electrobun window not loading
- Check `electrobun.config.ts` — entry point is `src/main/index.ts`
- View HTML files are copied from `src/renderers/ivde/index.html`
- Assets copied per the `copy` config in electrobun.config.ts

### Terminal (PTY) issues
- PTY is Zig code in `src/pty/` — needs Zig compiler
- Vendored Zig is at `vendors/zig/zig`
- Check build: `vendors/zig/zig build` in `src/pty/`

### File watcher issues
- Check `src/main/FileWatcher.ts`
- Vendored `fd` and `rg` in `vendor/` directory

## Plugin Issues

### Webflow plugin
- Separate package.json in `webflow-plugin/`
- Has its own `bun.lock` and `tsconfig.json`
- Entry: `webflow-plugin/src/index.ts`

### Test plugin
- Example plugin in `test-plugin/`
- Separate package.json

## Vendored Dependencies
The project vendors these binaries:
- `vendor/fd` — file finder
- `vendor/rg` — ripgrep search
- `vendor/git` — git binary
- `vendors/cmake/` — CMake build system
- `vendors/zig/` — Zig compiler

If vendored tools fail, check they have execute permissions:
```bash
chmod +x vendor/fd vendor/rg vendor/git
```

## MCP Server Issues
- Project MCP config: `.mcp.json`
- Global MCP config: `~/.mcp.json`
- Context7 needs API key in env
- Desktop Commander needs specific Node path
