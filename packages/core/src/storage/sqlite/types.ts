export interface SQLiteConfig {
	dbPath?: string
	useWAL?: boolean // Write Ahead Logging
	timeout?: number
	verbose?: boolean
}
