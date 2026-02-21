# Development Workflow

## Prerequisites
- Bun runtime installed
- Electrobun CLI available via `bun`
- Node.js (for MCP servers and tooling)

## Setup
```bash
git clone https://github.com/blackboardsh/colab.git
cd colab
bun install
bun run setup        # Run setup-deps script
```

## Daily Development

### Start Dev Environment
```bash
bun run dev          # Build + launch Electrobun dev mode
# Or step-by-step:
bun run build:dev    # Build only
bun run start:dev    # Launch only
```

### Build Variants
```bash
bun run build:dev     # Development build
bun run build:canary  # Canary release build
bun run build:stable  # Stable release build
```

### Documentation
```bash
bun run docs:dev      # Start docs dev server
bun run docs:build    # Build docs
bun run docs:serve    # Serve built docs
```

## Git Workflow
```bash
git checkout -b feature/name    # Create feature branch
# Make changes...
git add <specific-files>
git commit -m "description"
git push origin feature/name
# Create PR via gh or GitHub UI
```

## Release Process
```bash
bun run push:canary   # Bump prerelease + push tags
bun run push:patch    # Bump prepatch + push tags
bun run push:minor    # Bump preminor + push tags
bun run push:major    # Bump premajor + push tags
bun run push:stable   # Bump patch (stable) + push tags
```

## Key Directories
| Directory | What to Edit |
|-----------|-------------|
| `src/main/` | Main process logic, APIs, window management |
| `src/renderers/` | UI components, IDE renderer, styles |
| `src/shared/` | Types and utilities shared between processes |
| `src/pty/` | Terminal PTY (Zig code) |
| `webflow-plugin/` | Webflow Designer extension |
| `scripts/` | Build and deployment scripts |
