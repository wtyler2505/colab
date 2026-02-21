#!/bin/bash
# Verify all MCP servers and CLI tools are available
# Run: bash .claude/scripts/verify-env.sh

set -euo pipefail

PROJ_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PASS=0
FAIL=0
WARN=0

check() {
  local name="$1"
  local cmd="$2"
  if eval "$cmd" > /dev/null 2>&1; then
    echo "  [PASS] $name"
    ((PASS++))
  else
    echo "  [FAIL] $name"
    ((FAIL++))
  fi
}

warn() {
  local name="$1"
  local cmd="$2"
  if eval "$cmd" > /dev/null 2>&1; then
    echo "  [PASS] $name"
    ((PASS++))
  else
    echo "  [WARN] $name (optional)"
    ((WARN++))
  fi
}

echo "=== Environment Verification ==="
echo ""

echo "--- Core Tools ---"
check "bun" "bun --version"
check "node" "node --version"
check "npm" "npm --version"
check "git" "git --version"
check "typescript" "npx tsc --version"

echo ""
echo "--- Build Dependencies ---"
check "esbuild" "npx esbuild --version"
check "node_modules" "test -d '$PROJ_ROOT/node_modules'"
check "electrobun" "test -f '$PROJ_ROOT/node_modules/.package-lock.json'"

echo ""
echo "--- Vendored Binaries ---"
check "vendor/fd" "test -x '$PROJ_ROOT/vendor/fd'"
check "vendor/rg" "test -x '$PROJ_ROOT/vendor/rg'"
check "vendor/git" "test -x '$PROJ_ROOT/vendor/git'"
check "vendors/zig" "test -x '$PROJ_ROOT/vendors/zig/zig'"
check "vendors/cmake" "test -x '$PROJ_ROOT/vendors/cmake/bin/cmake'"

echo ""
echo "--- Optional CLI Tools ---"
warn "gh (GitHub CLI)" "gh --version"
warn "jq" "jq --version"
warn "fd (system)" "fd --version"
warn "rg (system)" "rg --version"
warn "fzf" "fzf --version"
warn "bat" "bat --version"
warn "ast-grep" "ast-grep --version"
warn "tmux" "tmux -V"
warn "docker" "docker --version"
warn "scc" "scc --version"

echo ""
echo "--- MCP Configs ---"
check "Project .mcp.json" "test -f '$PROJ_ROOT/.mcp.json'"
warn "Global ~/.mcp.json" "test -f '$HOME/.mcp.json'"

echo ""
echo "--- Project Structure ---"
check ".claude/ directory" "test -d '$PROJ_ROOT/.claude'"
check "CLAUDE.md" "test -f '$PROJ_ROOT/.claude/CLAUDE.md'"
check "core/ docs" "test -d '$PROJ_ROOT/.claude/core'"
check "docs/" "test -d '$PROJ_ROOT/.claude/docs'"
check "workflows/" "test -d '$PROJ_ROOT/.claude/workflows'"

echo ""
echo "=== Results ==="
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo "  Warnings: $WARN"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo "Some checks failed. Run setup:"
  echo "  bun install && bun run setup"
  exit 1
else
  echo ""
  echo "Environment OK!"
fi
