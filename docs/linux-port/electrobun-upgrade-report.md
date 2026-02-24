# Electrobun Upgrade Report: 1.13.1-beta.0 → v1.14.x

> Generated 2026-02-24. Sources: [Electrobun v1 blog](https://blackboard.sh/blog/electrobun-v1/), [GitHub releases](https://github.com/blackboardsh/electrobun/releases), [Electrobun docs](https://blackboard.sh/electrobun/docs/), [Architecture overview](https://blackboard.sh/electrobun/docs/guides/architecture/overview/)

## Version Summary

| Property | Current (co(lab)) | Latest Stable |
|----------|-------------------|---------------|
| Version | `1.13.1-beta.0` | `1.14.4` |
| npm | `electrobun@1.13.1-beta.0` | `electrobun@1.14.4` |
| Release date | Pre-v1 beta | Feb 23, 2026 |
| Linux support | No | Yes (Ubuntu 22.04+) |
| Windows support | No | Yes (Windows 11+) |
| CEF on Linux | N/A | Yes (`bundleCEF: true`, pure x11 windows) |

**Key insight:** The version numbering is continuous — `1.13.1-beta.0` → `1.13.1` (stable) → `1.14.x`. This is NOT a 0.x → 1.0 breaking rewrite. It's an incremental upgrade within the same major version. The "v1" marketing name refers to the first stable release, but the API lineage is continuous from the beta series.

## Release Timeline (from GitHub)

| Version | Date | Type |
|---------|------|------|
| 1.13.1-beta.0 | Feb 15, 2026 | Pre-release (co(lab) is HERE) |
| 1.13.1 | Feb 20, 2026 | Stable |
| 1.14.0-beta.0 | Feb 22, 2026 | Pre-release |
| 1.14.1-beta.0 | Feb 22, 2026 | Pre-release |
| 1.14.2-beta.0 | Feb 23, 2026 | Pre-release |
| 1.14.3-beta.0 | Feb 23, 2026 | Pre-release |
| 1.14.3 | Feb 23, 2026 | Stable |
| 1.14.4 | Feb 23, 2026 | Stable (LATEST) |

The gap is only **8 days and ~10 releases**. This is a rapid iteration cycle, not a major architectural shift.

## API Surface (v1 Stable)

The following APIs are documented for v1. Co(lab) already uses most of these:

| API Module | co(lab) Usage | Expected Changes |
|-----------|---------------|-----------------|
| BrowserWindow | Window creation, titleBarStyle | May have new Linux-specific options |
| BrowserView | Not directly used (uses Electroview) | N/A |
| Electroview | Renderer webview setup (init.ts) | Core API likely stable |
| Utils | showItemInFolder, moveToTrash, openFileDialog | Now cross-platform (Linux uses xdg-open, gio) |
| Application Menu | Native menus with accelerators | Accelerators now support Ctrl on Linux |
| Context Menu | Right-click menus | Cross-platform in v1 |
| Tray | System tray icon | Linux tray via libayatana-appindicator3 |
| Paths | App paths, resource paths | Platform-specific paths added |
| Events | App lifecycle events | May have new Linux events |
| Updater | Auto-update system | Now generates Linux artifacts |
| BuildConfig | electrobun.config.ts | New `linux` section needed alongside `mac` |

## Config Changes Required

### Current `electrobun.config.ts`:
```typescript
"build": {
    "mac": {
        "codesign": true,
        "notarize": true,
        "bundleCEF": true,
    }
}
```

### Needed for Linux:
```typescript
"build": {
    "mac": {
        "codesign": true,
        "notarize": true,
        "bundleCEF": true,
    },
    "linux": {
        "bundleCEF": true,    // Required for co(lab)'s multi-webview architecture
        "renderer": "cef",     // Use CEF over WebKitGTK
        // No code signing needed on Linux
    }
}
```

**Why CEF is required on Linux:** The docs explicitly state: "GTK and WebKitGTK cannot handle Electrobun's advanced webview layering and masking functionality." Co(lab) uses `<electrobun-webview>` extensively for browser tabs, which requires CEF's OOPIF support.

**Tradeoff:** CEF adds ~100MB+ to bundle size but is non-negotiable for co(lab)'s architecture.

## Linux System Requirements

From the GitHub README, building on Linux requires:
```bash
sudo apt install build-essential cmake pkg-config libgtk-3-dev \
    libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev
```

Runtime dependencies for end users:
- GTK3 (for window chrome even with CEF)
- libayatana-appindicator3 (for system tray)
- librsvg2 (for SVG icon rendering)

## Platform-Specific Behavioral Differences (v1)

Known differences that affect co(lab):

1. **Webview hidden & passthrough**: On macOS, hidden and passthrough are independent. On Linux, hiding a webview automatically enables click passthrough — no separate control.

2. **Title bar**: `titleBarStyle: "hiddenInset"` is macOS-only (traffic light buttons). Linux uses standard window decoration or `"default"`.

3. **File dialogs**: `Utils.openFileDialog()` uses native GTK dialogs on Linux (or xdg-desktop-portal if available).

4. **System tray**: Uses libayatana-appindicator3 on Linux instead of NSStatusItem on macOS.

5. **Bundle structure**: Linux uses a different directory layout than macOS .app bundles. Self-extracting ZSTD archives work the same way.

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| API breaking changes between beta.0 and 1.14.4 | **LOW** | Same version lineage, only 8 days apart. Run `bun install electrobun@1.14.4` and fix any TypeScript errors. |
| CEF bundle size on Linux (~100MB+) | **LOW** | Acceptable tradeoff. Same approach used on macOS already. |
| WebKitGTK fallback issues | **N/A** | Not using WebKitGTK — going straight to CEF. |
| Linux tray behavior differences | **LOW** | May need testing but libayatana is the standard Linux tray library. |
| Webview hidden/passthrough difference | **MEDIUM** | Co(lab) may use webview hiding for tab management. Test tab switching behavior on Linux. |
| Native menu accelerators | **LOW** | Already handled — platform-layer agent mapped Cmd→Ctrl. Electrobun v1 should handle this natively. |
| Auto-updater on Linux | **LOW** | Same bsdiff mechanism, just different bundle format. Needs testing. |
| Build CI/CD changes | **MEDIUM** | Need Linux runner in GitHub Actions. Build must run on Linux (no cross-compilation recommended). |

## Recommended Upgrade Strategy

**Approach: Incremental (low risk)**

Since the version gap is small (1.13.1-beta.0 → 1.14.4, same major lineage):

### Step 1: Upgrade on macOS first (30 min)
```bash
bun add electrobun@1.14.4
npx tsc --noEmit        # Fix any type errors
bun run dev             # Verify macOS still works
```

### Step 2: Add Linux build config (15 min)
Add `linux` section to `electrobun.config.ts` with `bundleCEF: true`.

### Step 3: First Linux build attempt (1-2 hours)
```bash
# On Linux machine with deps installed:
bun install
electrobun build --env=dev
```
Fix any build errors. Most likely issues:
- Missing Linux system deps (apt install)
- Path differences in postBuild script
- CEF download for Linux (first build will be slow)

### Step 4: Runtime testing on Linux (2-4 hours)
- Window creation and rendering
- Tab switching (webview show/hide behavior)
- System tray
- File dialogs
- Terminal (PTY — already fixed by native-builds agent)
- Keyboard shortcuts (already fixed by renderer-agent)
- Git operations (credential helper — already fixed by platform-layer agent)

## Estimated Effort

| Task | Time |
|------|------|
| `bun add electrobun@1.14.4` + fix TS errors | 30 min |
| Add Linux build config | 15 min |
| First Linux build + fix build errors | 1-2 hours |
| Runtime testing + bug fixes | 2-4 hours |
| CI/CD pipeline (GitHub Actions Linux runner) | 1-2 hours |
| **Total** | **4-8 hours** |

This is much less than originally estimated (4-6 weeks) because:
1. The version gap is tiny (8 days, same lineage)
2. Most application-level changes are already done by the other agents
3. Electrobun v1 handles most cross-platform concerns at the framework level

## Conclusion

The Electrobun upgrade is the **lowest-risk part** of the Linux port. The framework already supports Linux with CEF. The real work was in the application-level changes (PTY, platform abstraction, keyboard shortcuts, fonts, peer deps) — which are already complete.

Recommended next step: `bun add electrobun@1.14.4` and start testing.
