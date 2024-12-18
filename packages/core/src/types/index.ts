// packages/core/src/types/index.ts
import type { StorageAdapter } from './storage'

export type SnackCMS = {
	storage: StorageAdapter
	handlers: {
		create: (schema: string, data: Record<string, any>) => Promise<any>
		read: (schema: string, id: string) => Promise<any>
		update: (schema: string, id: string, data: Record<string, any>) => Promise<any>
		delete: (schema: string, id: string) => Promise<void>
		query: (schema: string, query: any) => Promise<any[]>
	}
	schemas: Record<string, any>
}

export * from './storage';
export * from './schema';
export * from './config';
