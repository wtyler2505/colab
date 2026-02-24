// Platform detection for renderer (runs in browser context)
export const IS_MAC = typeof navigator !== "undefined"
	? navigator.platform?.includes("Mac") ?? false
	: false

export const IS_LINUX = typeof navigator !== "undefined"
	? navigator.platform?.includes("Linux") ?? false
	: false

// Keyboard modifier key: metaKey (Cmd) on macOS, ctrlKey (Ctrl) on Linux/Windows
export const MOD_KEY: "metaKey" | "ctrlKey" = IS_MAC ? "metaKey" : "ctrlKey"

// Display label for the modifier key
export const MOD_LABEL = IS_MAC ? "Cmd" : "Ctrl"

// Display symbol for the modifier key
export const MOD_SYMBOL = IS_MAC ? "\u2318" : "Ctrl"

// Platform-aware "open in file manager" label
export const FILE_MANAGER_LABEL = IS_MAC ? "Finder" : "File Manager"
export const OPEN_IN_FILE_MANAGER_LABEL = IS_MAC ? "Open in Finder" : "Show in File Manager"

// Cross-platform font stacks
export const FONT_STACK_UI = "system-ui, -apple-system, 'Segoe UI', Ubuntu, Cantarell, 'Noto Sans', sans-serif"
export const FONT_STACK_MONO = "'JetBrains Mono', 'Fira Code', 'Ubuntu Mono', 'DejaVu Sans Mono', Monaco, 'Courier New', monospace"
export const FONT_STACK_CODE = "'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace"
