export interface PlatformAPI {
	// Credential storage
	checkGitHubCredentials(): Promise<{ hasCredentials: boolean; username?: string }>
	storeGitHubCredentials(username: string, token: string): Promise<void>
	removeGitHubCredentials(): Promise<void>
	getCredentialHelperPath(): string | null
	hasCredentialHelper(): boolean

	// File operations
	moveToTrash(absolutePath: string): Promise<void>
	showItemInFolder(path: string): void
	openExternal(url: string): void

	// System info
	platformName: "darwin" | "linux"
}
