import { platform } from "os"
import type { PlatformAPI } from "./types.ts"

let _platform: PlatformAPI | null = null

export function getPlatform(): PlatformAPI {
	if (!_platform) {
		if (platform() === "darwin") {
			// Dynamic require to avoid loading unused platform code
			const { DarwinPlatform } = require("./darwin.ts")
			_platform = new DarwinPlatform()
		} else {
			const { LinuxPlatform } = require("./linux.ts")
			_platform = new LinuxPlatform()
		}
	}
	return _platform
}

export type { PlatformAPI } from "./types.ts"
