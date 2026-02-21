#!/bin/bash
# Re-scan MCP servers and CLI tools, update documentation
# Run: bash .claude/scripts/update-tools.sh

set -euo pipefail

CLAUDE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "Updating tool documentation in: $CLAUDE_DIR"

# --- CLI Tools Detection ---
echo ""
echo "=== CLI Tools Detection ==="
CLI_FILE="$CLAUDE_DIR/core/tools-cli.md"

tools=(
  "bun:Bun runtime:bun --version"
  "node:Node.js runtime:node --version"
  "npm:Node package manager:npm --version"
  "git:Version control:git --version"
  "gh:GitHub CLI:gh --version"
  "docker:Container runtime:docker --version"
  "python3:Python runtime:python3 --version"
  "cargo:Rust build system:cargo --version"
  "rustc:Rust compiler:rustc --version"
  "jq:JSON processor:jq --version"
  "curl:HTTP client:curl --version"
  "fd:File finder:fd --version"
  "rg:Ripgrep search:rg --version"
  "fzf:Fuzzy finder:fzf --version"
  "bat:Cat with highlighting:bat --version"
  "tree:Directory tree:tree --version"
  "ast-grep:Structural code search:ast-grep --version"
  "tmux:Terminal multiplexer:tmux -V"
  "esbuild:JS bundler:npx esbuild --version"
  "tsc:TypeScript compiler:npx tsc --version"
  "scc:Code statistics:scc --version"
)

echo "# System CLI Tools" > "$CLI_FILE"
echo "" >> "$CLI_FILE"
echo "## Detected Tools" >> "$CLI_FILE"
echo "| Tool | Version | Purpose |" >> "$CLI_FILE"
echo "|------|---------|---------|" >> "$CLI_FILE"

for entry in "${tools[@]}"; do
  IFS=':' read -r name desc cmd <<< "$entry"
  if version=$($cmd 2>&1 | head -1); then
    echo "| **$name** | $version | $desc |" >> "$CLI_FILE"
    echo "  [OK] $name: $version"
  else
    echo "  [--] $name: not found"
  fi
done

# Check vendored tools
echo "" >> "$CLI_FILE"
echo "## Vendored Tools" >> "$CLI_FILE"
echo "| Tool | Version | Location |" >> "$CLI_FILE"
echo "|------|---------|----------|" >> "$CLI_FILE"

PROJ_ROOT="$(cd "$CLAUDE_DIR/.." && pwd)"
for vendored in "$PROJ_ROOT/vendor/fd" "$PROJ_ROOT/vendor/rg" "$PROJ_ROOT/vendor/git"; do
  if [ -x "$vendored" ]; then
    name=$(basename "$vendored")
    version=$("$vendored" --version 2>&1 | head -1)
    echo "| **$name** | $version | vendor/$name |" >> "$CLI_FILE"
    echo "  [OK] vendored $name: $version"
  fi
done

echo ""
echo "Updated: $CLI_FILE"

# --- MCP Server Detection ---
echo ""
echo "=== MCP Server Detection ==="
MCP_FILE="$CLAUDE_DIR/core/tools-mcp.md"

echo "Checking MCP configs..."
for config in "$PROJ_ROOT/.mcp.json" "$HOME/.mcp.json"; do
  if [ -f "$config" ]; then
    echo "  Found: $config"
    echo "  Servers: $(jq -r '.mcpServers | keys[]' "$config" 2>/dev/null | tr '\n' ', ')"
  fi
done

echo ""
echo "MCP documentation requires manual update or Claude Code session."
echo "Run 'claude' and use /sp-superinit to regenerate full MCP docs."

echo ""
echo "=== Done ==="
echo "Updated files:"
echo "  - $CLI_FILE"
echo "  - $MCP_FILE (manual update needed for full refresh)"
