import { existsSync } from "fs"
import { execSync } from "child_process"
import { execSpawnSync } from "../utils/processUtils"
import { BUN_BINARY_PATH } from "../consts/paths"

export const isInstalled = () => {
	// BUN_BINARY_PATH already resolves to system bun on Linux via resolveVendoredBinary
	if (existsSync(BUN_BINARY_PATH)) {
		return true
	}
	// Last resort: check if bun is available on PATH
	if (process.platform === "linux") {
		try {
			const result = execSync("which bun", { encoding: "utf-8" }).trim()
			return !!result
		} catch {
			return false
		}
	}
	return false
}

export const getVersion = (forceRefetch = false) => {
	const result = execSpawnSync(BUN_BINARY_PATH, ["--version"])
	return result.stdout || ""
}

export const install = () => {
	if (isInstalled()) {
		return
	}

	// On macOS: electrobun bundles bun
	// On Linux: bun should be installed via curl -fsSL https://bun.sh/install | bash
	if (process.platform === "linux") {
		console.log("bun not found. Install via: curl -fsSL https://bun.sh/install | bash")
	} else {
		console.log("bun not bundled correctly")
	}
}
