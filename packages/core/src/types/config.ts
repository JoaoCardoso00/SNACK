import { type SnackSchema } from './schema'
import type { StorageAdapter } from './storage'
import type { SQLiteConfig } from '../storage/sqlite/types'

export type SnackConfig = {
	storage?: {
		adapter?: StorageAdapter
		sqlite?: SQLiteConfig
	}
	schemas: Record<string, SnackSchema>
}
