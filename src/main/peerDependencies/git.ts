// mkdir homebrew && curl -L https://github.com/Homebrew/brew/tarball/master | tar xz --strip 1 -C homebrew

import { existsSync } from "fs"
import { execSync } from "child_process"
import { execSpawnSync } from "../utils/processUtils"
import { GIT_BINARY_PATH } from "../consts/paths"

export const isInstalled = () => {
	// GIT_BINARY_PATH already resolves to system git on Linux via resolveVendoredBinary
	if (existsSync(GIT_BINARY_PATH)) {
		return true
	}
	// Last resort: check if git is available on PATH
	if (process.platform === "linux") {
		try {
			const result = execSync("which git", { encoding: "utf-8" }).trim()
			return !!result
		} catch {
			return false
		}
	}
	return false
}

export const getVersion = (forceRefetch = false) => {
	const result = execSpawnSync(GIT_BINARY_PATH, ["--version"])
	const versionResult = result.stdout || ""
	return versionResult.replace(/[^\d]*([\d.]+)[^\d]*/, "$1")
}

export const install = () => {
	if (isInstalled()) {
		return
	}

	// Note: we should migrate to libgit2 for bun, but it's a bigger task
	// On macOS: bundled via homebrew through electrobun.config
	// On Linux: git should be installed via system package manager (apt, dnf, etc.)
	if (process.platform === "linux") {
		console.log("git not found. Install via your system package manager: sudo apt install git")
	} else {
		console.log("git not bundled correctly")
	}
}
