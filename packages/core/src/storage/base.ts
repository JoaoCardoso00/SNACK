import { type SchemaField } from '../types';
import type { StorageAdapter, QueryOptions } from '../types/storage'

export abstract class BaseStorage implements StorageAdapter {
	abstract connect(): Promise<void>
	abstract disconnect(): Promise<void>
	abstract create(schema: string, data: Record<string, any>): Promise<any>
	abstract prepareSchema(schema: string, fields: SchemaField[]): Promise<void>
	abstract read(schema: string, id: string): Promise<any>
	abstract update(schema: string, id: string, data: Record<string, any>): Promise<any>
	abstract delete(schema: string, id: string): Promise<void>
	abstract query(schema: string, options: QueryOptions): Promise<any[]>
}
