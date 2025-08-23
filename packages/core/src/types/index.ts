// packages/core/src/types/index.ts
import type { StorageAdapter } from './storage'

export interface SchemaHandlers {
	create: (data: Record<string, any>) => Promise<any>
	findById: (id: string) => Promise<any>
	findMany: (options?: {
		limit?: number
		offset?: number
		orderBy?: string
		order?: 'asc' | 'desc'
	}) => Promise<any[]>
	update: (id: string, data: Record<string, any>) => Promise<any>
	delete: (id: string) => Promise<boolean>
}

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
	[key: string]: any // Allow dynamic schema handlers
}

export * from './storage';
export * from './schema';
export * from './config';
