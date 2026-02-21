# System CLI Tools

## Runtime & Package Managers
| Tool | Version | Purpose |
|------|---------|---------|
| **bun** | 1.3.4 | Fast JS runtime, bundler, package manager |
| **node** | 18.19.1 | JavaScript runtime (V8) |
| **npm** | 9.2.0 | Node.js package manager |
| **npx** | 9.2.0 | Execute npm package binaries |

## Version Control & GitHub
| Tool | Version | Purpose |
|------|---------|---------|
| **git** | 2.43.0 | Distributed version control |
| **gh** | 2.87.2 | GitHub CLI (issues, PRs, repos, actions) |
| **delta** | 0.18.2 | Syntax-highlighting diff viewer |

## Languages & Compilers
| Tool | Version | Purpose |
|------|---------|---------|
| **python3** | 3.12.3 | Python interpreter |
| **pip3** | 24.0 | Python package installer |
| **cargo** | 1.90.0 | Rust package manager / build system |
| **rustc** | 1.90.0 | Rust compiler |
| **cmake** | 3.28.3 | Cross-platform build system generator |

## Search & Find
| Tool | Version | Purpose |
|------|---------|---------|
| **fd** | 10.3.0 | Fast file finder (replaces `find`) |
| **rg** | 14.1.1 | Blazing fast recursive text search |
| **fzf** | 0.65.2 | Fuzzy finder for interactive filtering |
| **ast-grep** | 0.40.3 | Structural code search using AST patterns |

## Data Processing
| Tool | Version | Purpose |
|------|---------|---------|
| **jq** | 1.7 | Command-line JSON processor |
| **yq** | 4.44.3 | YAML/JSON/XML processor |

## Web & HTTP
| Tool | Version | Purpose |
|------|---------|---------|
| **curl** | 8.5.0 | HTTP client |
| **wget** | 1.21.4 | Network file downloader |
| **trafilatura** | 2.0.0 | Web content extraction (articles) |
| **shot-scraper** | 1.8 | Automated web screenshots |
| **monolith** | 2.10.1 | Save complete web pages as single HTML |
| **pup** | 0.4.0 | HTML parser (like jq for HTML) |

## Code Analysis
| Tool | Version | Purpose |
|------|---------|---------|
| **scc** | 3.4.0 | Code counter with complexity metrics |
| **tokei** | 12.1.2 | Lines of code counter by language |
| **lizard** | 1.19.0 | Cyclomatic complexity analyzer |

## System & Files
| Tool | Version | Purpose |
|------|---------|---------|
| **bat** | 0.25.0 | Cat with syntax highlighting + git |
| **tree** | 2.1.1 | Directory structure visualization |
| **ncdu** | 1.19 | NCurses disk usage analyzer |
| **htop** | 3.3.0 | Interactive process viewer |
| **btop** | 1.4.5 | Resource monitor (CPU, mem, disk, net) |
| **tmux** | 3.4 | Terminal multiplexer |

## Not Installed
| Tool | Notes |
|------|-------|
| docker | Container runtime not available |
| zig | Not on PATH (vendored in `vendors/zig/` for builds) |
| esbuild | Local dep only (`node_modules`) |
| tsc | Local dep only (`node_modules`) |

## Vendored Binaries (macOS ARM)
The `vendor/` directory contains **macOS ARM64 (Mach-O)** binaries for the packaged app:
- `vendor/fd` — file finder (for macOS app bundle)
- `vendor/rg` — ripgrep (for macOS app bundle)
- `vendor/git` — git (for macOS app bundle)

These are NOT usable on this Linux x86_64 dev machine. Use system-installed versions instead.

## Tool Selection Rules
1. **Code search** → `ast-grep` (structural, AST-aware) or `rg` (text patterns)
2. **File finding** → `fd` (faster than find)
3. **JSON processing** → `jq`
4. **YAML/XML** → `yq`
5. **HTML parsing** → `pup`
6. **Web content** → `trafilatura` (articles), `shot-scraper` (screenshots)
7. **TUI tools** → Use via tmux (`htop`, `btop`, etc.)
8. **Code stats** → `scc` (overview), `tokei` (LOC), `lizard` (complexity)
