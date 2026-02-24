import { existsSync } from "fs"
import { Utils } from "electrobun/bun"
import type { PlatformAPI } from "./types.ts"

const OSXKEYCHAIN_HELPER = "/Library/Developer/CommandLineTools/usr/libexec/git-core/git-credential-osxkeychain"

export class DarwinPlatform implements PlatformAPI {
	platformName = "darwin" as const

	private _hasKeychainHelper: boolean

	constructor() {
		this._hasKeychainHelper = existsSync(OSXKEYCHAIN_HELPER)
	}

	getCredentialHelperPath(): string | null {
		if (this._hasKeychainHelper) {
			return OSXKEYCHAIN_HELPER
		}
		return null
	}

	hasCredentialHelper(): boolean {
		return this._hasKeychainHelper
	}

	async checkGitHubCredentials(): Promise<{ hasCredentials: boolean; username?: string }> {
		if (!this._hasKeychainHelper) {
			return { hasCredentials: false }
		}

		try {
			const { execSync } = await import("child_process")
			const result = execSync("security find-internet-password -s github.com 2>/dev/null", { encoding: "utf-8" })

			// Parse the account name from the output
			const acctMatch = result.match(/"acct"<blob>="([^"]+)"/)
			const username = acctMatch ? acctMatch[1] : undefined

			return { hasCredentials: true, username }
		} catch (error) {
			// No credentials found or error accessing keychain
			return { hasCredentials: false }
		}
	}

	async storeGitHubCredentials(username: string, token: string): Promise<void> {
		if (!this._hasKeychainHelper) {
			throw new Error("macOS Keychain credential helper not available")
		}

		try {
			const { execSync } = await import("child_process")

			const input = `protocol=https
host=github.com
username=${username}
password=${token}
`
			execSync(`printf '%s' "${input}" | ${OSXKEYCHAIN_HELPER} store`, { encoding: "utf-8" })
		} catch (error) {
			console.error("Error storing GitHub credentials:", error)
			throw error
		}
	}

	async removeGitHubCredentials(): Promise<void> {
		if (!this._hasKeychainHelper) {
			throw new Error("macOS Keychain credential helper not available")
		}

		try {
			const { execSync } = await import("child_process")

			const input = `protocol=https\nhost=github.com\n`
			execSync(`echo "${input}" | ${OSXKEYCHAIN_HELPER} erase`, { encoding: "utf-8" })
		} catch (error) {
			console.error("Error removing GitHub credentials:", error)
			throw error
		}
	}

	async moveToTrash(absolutePath: string): Promise<void> {
		Utils.moveToTrash(absolutePath)
	}

	showItemInFolder(path: string): void {
		Utils.showItemInFolder(path)
	}

	openExternal(url: string): void {
		const { execSync } = require("child_process")
		execSync(`open "${url}"`)
	}
}
