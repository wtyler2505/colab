# Deployment

## Build Pipeline

### Development
```bash
bun run build:dev     # Local development build
bun run start:dev     # Launch dev instance
```

### Canary Releases
```bash
bun run build:canary  # Build canary variant
bun run push:canary   # npm version prerelease + push tags
```

### Stable Releases
```bash
bun run build:stable  # Build stable variant
bun run push:stable   # npm version patch + push tags
```

## Release Infrastructure
- Release base URL: `https://colab-releases.blackboard.sh/`
- Configured in `electrobun.config.ts` under `release.baseUrl`
- Artifacts uploaded via `scripts/upload-artifacts.ts`

## macOS Specifics
- Code signing enabled (`codesign: true`)
- Notarization enabled (`notarize: true`)
- CEF bundled (`bundleCEF: true`)
- Entitlements configured (currently empty)

## Post-Build
- Script: `scripts/postBuild.ts` runs after build
- Handles asset copying and final packaging

## GitHub Integration
- GitHub Actions: `.github/` directory
- Repository: `blackboardsh/colab`
- Tags trigger release builds

## Version Scheme
- Stable: `0.14.7` (semver)
- Canary: `0.14.7-canary.N` (prerelease)
- Managed via `npm version` commands in package.json scripts
