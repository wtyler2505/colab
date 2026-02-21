# Performance Budgets

## Desktop App Targets
| Metric | Budget | Notes |
|--------|--------|-------|
| App startup | < 3s | Electrobun window + renderer load |
| Editor ready | < 2s | Monaco editor fully interactive |
| Terminal ready | < 1s | xterm + PTY connection |
| File tree load | < 500ms | Initial directory scan |
| Tab switch | < 100ms | Between editor/browser/terminal |

## Build Performance
| Metric | Budget | Notes |
|--------|--------|-------|
| Dev build | < 30s | Full `bun run build:dev` |
| Incremental | < 5s | Hot reload / watch mode |
| esbuild bundle | < 3s | JS/TS compilation |

## Memory
| Component | Budget | Notes |
|-----------|--------|-------|
| Main process | < 100MB | Electrobun main |
| Renderer | < 300MB | Monaco + components |
| Per terminal | < 50MB | xterm instance |
| Total app | < 500MB | All processes combined |

## Bundle Size
| Asset | Budget | Notes |
|-------|--------|-------|
| Main bundle | < 5MB | Minified JS |
| Monaco editor | < 10MB | Editor core + languages |
| CSS | < 200KB | Tailwind purged |
| xterm | < 500KB | Terminal renderer |

## Vendored Binaries
| Binary | Size | Notes |
|--------|------|-------|
| fd | ~3MB | File finder |
| rg | ~5MB | Ripgrep search |
| git | ~15MB | Git operations |
| zig | ~40MB | Compiler (build only) |
| cmake | ~30MB | Build system (build only) |
