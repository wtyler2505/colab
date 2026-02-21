# Testing Strategy

## Current State
No formal test framework detected in the project. The `test-plugin/` directory contains an example plugin, not a test suite.

## TypeScript Checking
TypeScript strict mode acts as the primary static analysis:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `noPropertyAccessFromIndexSignature: true`

Run type checking:
```bash
npx tsc --noEmit
```

## Build Verification
The build process itself serves as integration validation:
```bash
bun run build:dev    # Full build pipeline
```

## Manual Testing
- Launch with `bun run dev` and verify:
  - Window opens correctly
  - Monaco editor loads
  - Terminal (xterm) works
  - File tree populates
  - Browser view renders

## Plugin Testing
- Test plugin at `test-plugin/` serves as example
- Webflow plugin has its own build: `cd webflow-plugin && bun install`

## Recommended Additions
- Unit tests: Vitest (SolidJS compatible)
- E2E: Playwright (for Electrobun window testing)
- Component tests: @solidjs/testing-library
