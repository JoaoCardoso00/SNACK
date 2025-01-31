import { Storage } from './storage'
import { createHandlers } from './handlers'
import type { SnackConfig } from './types'
import type { SnackCMS } from './types'

export async function createCMS(config: SnackConfig): Promise<SnackCMS> {

	const storage = new Storage()
	await storage.connect()

	for (const [name, schema] of Object.entries(config.schemas)) {
		await storage.prepareSchema(name, schema.fields)
	}

	// Create handlers
	const handlers = createHandlers(storage)

	return {
		storage,
		handlers,
		schemas: config.schemas
	}
}

export * from './types'
export * from './storage'
export * from './handlers'
