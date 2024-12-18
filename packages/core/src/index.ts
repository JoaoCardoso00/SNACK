export * from './storage/sqlite/adapter'
export * from './storage/sqlite/types'
export * from './handlers/crud'
export * from './storage/base'

import { SQLiteStorage } from './storage/sqlite/adapter'
import { createHandlers } from './handlers/crud'
import type { SnackConfig } from './types/config'

export async function createSnack(config: SnackConfig) {
	const storage = config.storage?.adapter || new SQLiteStorage(config.storage?.sqlite)

	await storage.connect()

	for (const [name, schema] of Object.entries(config.schemas)) {
		await storage.prepareSchema(name, schema.fields)
	}

	const handlers = createHandlers(storage)

	return {
		storage,
		handlers,
		schemas: config.schemas
	}
}

export async function init(config: SnackConfig) {
	return createSnack(config)
}

export * from './types'
export * from './schema'
export * from './storage'
export * from './handlers'
