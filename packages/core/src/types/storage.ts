import { type SchemaField } from "./schema"

export type StorageAdapter = {
	connect(): Promise<void>
	disconnect(): Promise<void>
	prepareSchema(schema: string, fields: SchemaField[]): Promise<void>
	create(schema: string, data: Record<string, any>): Promise<any>
	read(schema: string, id: string): Promise<any>
	update(schema: string, id: string, data: Record<string, any>): Promise<any>
	delete(schema: string, id: string): Promise<void>
	query(schema: string, query: QueryOptions): Promise<any[]>
}

export type QueryOptions = {
	where?: Record<string, any>
	select?: string[]
	include?: Record<string, boolean>
	skip?: number
	take?: number
	orderBy?: Record<string, 'asc' | 'desc'>
}
