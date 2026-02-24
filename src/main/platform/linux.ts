import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs"
import { homedir } from "os"
import { join, dirname } from "path"
import type { PlatformAPI } from "./types.ts"

// Possible paths for libsecret-based git credential helper
const LIBSECRET_HELPER_PATHS = [
	"/usr/lib/git-core/git-credential-libsecret",
	"/usr/libexec/git-core/git-credential-libsecret",
	"/usr/lib/git/git-credential-libsecret",
]

// Fallback: git-credential-store (plaintext ~/.git-credentials)
const CREDENTIAL_STORE_HELPER = "store"

export class LinuxPlatform implements PlatformAPI {
	platformName = "linux" as const

	private _credentialHelperPath: string | null = null
	private _hasCredentialHelper: boolean = false

	constructor() {
		// Check for libsecret-based helper first (preferred, uses system keyring)
		for (const helperPath of LIBSECRET_HELPER_PATHS) {
			if (existsSync(helperPath)) {
				this._credentialHelperPath = helperPath
				this._hasCredentialHelper = true
				break
			}
		}

		// Fallback to git-credential-store if no libsecret helper found
		if (!this._credentialHelperPath) {
			this._credentialHelperPath = CREDENTIAL_STORE_HELPER
			this._hasCredentialHelper = true
		}
	}

	getCredentialHelperPath(): string | null {
		return this._credentialHelperPath
	}

	hasCredentialHelper(): boolean {
		return this._hasCredentialHelper
	}

	async checkGitHubCredentials(): Promise<{ hasCredentials: boolean; username?: string }> {
		// Try secret-tool (libsecret / GNOME Keyring) first
		try {
			const proc = Bun.spawn(
				["secret-tool", "lookup", "server", "github.com", "protocol", "https"],
				{ stdout: "pipe", stderr: "pipe" }
			)
			const output = await new Response(proc.stdout).text()
			await proc.exited

			if (proc.exitCode === 0 && output.trim()) {
				// secret-tool returns the password; try to get the username via attribute lookup
				const username = await this._getSecretToolUsername()
				return { hasCredentials: true, username: username || undefined }
			}
		} catch {
			// secret-tool not available or failed
		}

		// Fallback: check ~/.git-credentials file
		try {
			const credPath = join(homedir(), ".git-credentials")
			if (existsSync(credPath)) {
				const content = readFileSync(credPath, "utf-8")
				const match = content.match(/https:\/\/([^:]+):[^@]+@github\.com/)
				if (match) {
					return { hasCredentials: true, username: match[1] }
				}
			}
		} catch {
			// Failed to read credentials file
		}

		return { hasCredentials: false }
	}

	async storeGitHubCredentials(username: string, token: string): Promise<void> {
		// Try secret-tool (libsecret) first
		try {
			const proc = Bun.spawn(
				[
					"secret-tool", "store",
					"--label", "GitHub credentials for co(lab)",
					"server", "github.com",
					"protocol", "https",
					"user", username,
				],
				{ stdin: "pipe", stdout: "pipe", stderr: "pipe" }
			)
			const writer = proc.stdin.getWriter()
			await writer.write(new TextEncoder().encode(token))
			await writer.close()
			await proc.exited

			if (proc.exitCode === 0) {
				return
			}
		} catch {
			// secret-tool not available, fall through to file-based storage
		}

		// Fallback: store in ~/.git-credentials
		const credPath = join(homedir(), ".git-credentials")
		const credLine = `https://${username}:${token}@github.com\n`

		let content = ""
		if (existsSync(credPath)) {
			content = readFileSync(credPath, "utf-8")
			// Remove any existing github.com entry
			content = content
				.split("\n")
				.filter((line) => !line.includes("@github.com"))
				.join("\n")
		}

		content = content.trim() + "\n" + credLine
		writeFileSync(credPath, content, { mode: 0o600 })
	}

	async removeGitHubCredentials(): Promise<void> {
		// Try secret-tool (libsecret) first
		try {
			const proc = Bun.spawn(
				["secret-tool", "clear", "server", "github.com", "protocol", "https"],
				{ stdout: "pipe", stderr: "pipe" }
			)
			await proc.exited
		} catch {
			// secret-tool not available
		}

		// Also remove from ~/.git-credentials if present
		try {
			const credPath = join(homedir(), ".git-credentials")
			if (existsSync(credPath)) {
				const content = readFileSync(credPath, "utf-8")
				const filtered = content
					.split("\n")
					.filter((line) => !line.includes("@github.com"))
					.join("\n")
				writeFileSync(credPath, filtered, { mode: 0o600 })
			}
		} catch (error) {
			console.error("Error removing GitHub credentials from ~/.git-credentials:", error)
		}
	}

	async moveToTrash(absolutePath: string): Promise<void> {
		// Use gio trash (GNOME/freedesktop standard)
		try {
			const proc = Bun.spawn(["gio", "trash", absolutePath], {
				stdout: "pipe",
				stderr: "pipe",
			})
			await proc.exited

			if (proc.exitCode === 0) {
				return
			}
		} catch {
			// gio not available
		}

		// Fallback: use trash-cli if installed
		try {
			const proc = Bun.spawn(["trash-put", absolutePath], {
				stdout: "pipe",
				stderr: "pipe",
			})
			await proc.exited

			if (proc.exitCode === 0) {
				return
			}
		} catch {
			// trash-put not available
		}

		// Last resort: move to freedesktop trash manually
		const trashDir = join(homedir(), ".local", "share", "Trash")
		const trashFilesDir = join(trashDir, "files")
		const trashInfoDir = join(trashDir, "info")

		mkdirSync(trashFilesDir, { recursive: true })
		mkdirSync(trashInfoDir, { recursive: true })

		const fileName = absolutePath.split("/").pop() || "unknown"
		const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "")
		const trashInfoContent = `[Trash Info]\nPath=${absolutePath}\nDeletionDate=${timestamp}\n`

		const { renameSync } = await import("fs")
		writeFileSync(join(trashInfoDir, `${fileName}.trashinfo`), trashInfoContent)
		renameSync(absolutePath, join(trashFilesDir, fileName))
	}

	showItemInFolder(path: string): void {
		// Use xdg-open on the parent directory
		const parentDir = dirname(path)
		Bun.spawn(["xdg-open", parentDir], {
			stdout: "pipe",
			stderr: "pipe",
		})
	}

	openExternal(url: string): void {
		Bun.spawn(["xdg-open", url], {
			stdout: "pipe",
			stderr: "pipe",
		})
	}

	// Helper: try to get username from secret-tool attributes
	private async _getSecretToolUsername(): Promise<string | null> {
		try {
			// secret-tool search returns attributes including "user"
			const proc = Bun.spawn(
				["secret-tool", "search", "server", "github.com", "protocol", "https"],
				{ stdout: "pipe", stderr: "pipe" }
			)
			const output = await new Response(proc.stdout).text()
			await proc.exited

			const match = output.match(/attribute\.user\s*=\s*(.+)/)
			return match ? match[1].trim() : null
		} catch {
			return null
		}
	}
}
