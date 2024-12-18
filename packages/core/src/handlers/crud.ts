import type { QueryOptions, StorageAdapter } from '../types/storage'

export function createHandlers(storage: StorageAdapter) {
	return {
		async create(schema: string, data: Record<string, any>) {
			return storage.create(schema, data)
		},

		async read(schema: string, id: string) {
			return storage.read(schema, id)
		},

		async update(schema: string, id: string, data: Record<string, any>) {
			return storage.update(schema, id, data)
		},

		async delete(schema: string, id: string) {
			return storage.delete(schema, id)
		},

		async query(schema: string, options: QueryOptions) {
			return storage.query(schema, options)
		}
	}
}
