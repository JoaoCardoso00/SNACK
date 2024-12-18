// packages/core/src/storage/sqlite/adapter.ts
import Database from 'better-sqlite3'
import type { StorageAdapter, QueryOptions, SchemaField } from '../../types'
import type { SQLiteConfig } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function getSQLiteType(fieldType: string): string {
	switch (fieldType) {
		case 'string':
		case 'media':
		case 'enum':
			return 'TEXT'
		case 'number':
			return 'REAL'
		case 'boolean':
			return 'INTEGER'
		case 'date':
			return 'TEXT'
		case 'json':
		case 'array':
			return 'TEXT'
		case 'reference':
			return 'TEXT'
		default:
			return 'TEXT'
	}
}

function serializeValue(value: any, type: string): any {
	if (value === null || value === undefined) return null

	switch (type) {
		case 'boolean':
			return value ? 1 : 0
		case 'json':
		case 'array':
			return JSON.stringify(value)
		case 'date':
			return value instanceof Date ? value.toISOString() : value
		default:
			return value
	}
}

function deserializeValue(value: any, type: string): any {
	if (value === null || value === undefined) return null

	switch (type) {
		case 'boolean':
			return Boolean(value)
		case 'json':
		case 'array':
			return value ? JSON.parse(value) : null
		case 'date':
			return value ? new Date(value) : null
		default:
			return value
	}
}

export class SQLiteStorage implements StorageAdapter {
	private db: Database.Database | null = null
	private config: SQLiteConfig
	private schemas: Map<string, SchemaField[]> = new Map()

	constructor(config: SQLiteConfig = {}) {
		this.config = {
			dbPath: ':memory:',
			useWAL: true,
			timeout: 5000,
			verbose: false,
			...config
		}
	}

	async connect(): Promise<void> {
		if (this.db) return

		this.db = new Database(this.config.dbPath, {
			verbose: this.config.verbose ? console.log : undefined,
			timeout: this.config.timeout
		})

		if (this.config.useWAL) {
			this.db.pragma('journal_mode = WAL')
		}
	}

	async disconnect(): Promise<void> {
		if (this.db) {
			this.db.close()
			this.db = null
		}
	}

	private ensureConnection() {
		if (!this.db) {
			throw new Error('Database not connected')
		}
		return this.db
	}

	private getFieldType(schema: string, fieldName: string): string {
		const fields = this.schemas.get(schema)
		const field = fields?.find(f => f.name === fieldName)
		return field?.type || 'string'
	}

	private applyDefaultValues(schema: string, data: Record<string, any>): Record<string, any> {
		const fields = this.schemas.get(schema) || []
		const result = { ...data }

		for (const field of fields) {
			if (!(field.name in result) && 'defaultValue' in field) {
				result[field.name] = field.defaultValue
			}
		}

		return result
	}

	private serializeRow(schema: string, data: Record<string, any>): Record<string, any> {
		const serialized: Record<string, any> = {}
		for (const [key, value] of Object.entries(data)) {
			const type = this.getFieldType(schema, key)
			serialized[key] = serializeValue(value, type)
		}
		return serialized
	}

	private deserializeRow(schema: string, row: unknown): Record<string, any> | null {
		if (!isRecord(row)) return null

		const deserialized: Record<string, any> = {}
		for (const [key, value] of Object.entries(row)) {
			const type = this.getFieldType(schema, key)
			deserialized[key] = deserializeValue(value, type)
		}
		return deserialized
	}

	async prepareSchema(schema: string, fields: SchemaField[]): Promise<void> {
		const db = this.ensureConnection()
		this.schemas.set(schema, fields)

		const fieldDefinitions = fields.map(field => {
			const sqlType = getSQLiteType(field.type)
			const constraints = [
				field.required ? 'NOT NULL' : 'NULL',
				field.unique ? 'UNIQUE' : '',
			].filter(Boolean).join(' ')

			return `${field.name} ${sqlType} ${constraints}`
		})

		// Add system columns
		fieldDefinitions.push('id TEXT PRIMARY KEY')
		fieldDefinitions.push('created_at TEXT NOT NULL')
		fieldDefinitions.push('updated_at TEXT NOT NULL')

		const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${schema} (
        ${fieldDefinitions.join(',\n        ')}
      )
    `

		db.exec(createTableQuery)
	}

	async create(schema: string, data: Record<string, any>): Promise<any> {
		const db = this.ensureConnection()
		const now = new Date().toISOString()

		const withDefaults = this.applyDefaultValues(schema, data)
		const serializedData = this.serializeRow(schema, withDefaults)

		const fields = ['id', ...Object.keys(serializedData), 'created_at', 'updated_at']
		const id = crypto.randomUUID()

		const values = [
			id,
			...Object.values(serializedData).map(value =>
				value === undefined ? null : value
			),
			now,
			now
		]

		const placeholders = values.map(() => '?').join(', ')

		const query = `
      INSERT INTO ${schema} (${fields.join(', ')})
      VALUES (${placeholders})
    `

		const stmt = db.prepare(query)
		stmt.run(values)

		return this.read(schema, id)
	}

	async read(schema: string, id: string): Promise<any> {
		const db = this.ensureConnection()
		const stmt = db.prepare(`SELECT * FROM ${schema} WHERE id = ?`)
		const row = stmt.get(id)
		return this.deserializeRow(schema, row)
	}

	async update(schema: string, id: string, data: Record<string, any>): Promise<any> {
		const db = this.ensureConnection()
		const serializedData = this.serializeRow(schema, data)
		const updates = Object.keys(serializedData).map(key => `${key} = ?`).join(', ')

		const values = [
			...Object.values(serializedData).map(value =>
				value === undefined ? null : value
			),
			new Date().toISOString(),
			id
		]

		const stmt = db.prepare(`
      UPDATE ${schema}
      SET ${updates}, updated_at = ?
      WHERE id = ?
    `)

		stmt.run(values)

		// After update, fetch the updated record
		return this.read(schema, id)
	}

	async delete(schema: string, id: string): Promise<void> {
		const db = this.ensureConnection()
		const stmt = db.prepare(`DELETE FROM ${schema} WHERE id = ?`)
		stmt.run(id)
	}

	async query(schema: string, options: QueryOptions): Promise<any[]> {
		const db = this.ensureConnection()
		let query = `SELECT * FROM ${schema}`
		const params: any[] = []

		if (options.where) {
			const serializedWhere = this.serializeRow(schema, options.where)
			const conditions = Object.entries(serializedWhere)
				.map(([key, value]) => {
					params.push(value === undefined ? null : value)
					return `${key} = ?`
				})
				.join(' AND ')
			query += ` WHERE ${conditions}`
		}

		if (options.orderBy) {
			const orderClauses = Object.entries(options.orderBy)
				.map(([key, dir]) => `${key} ${dir}`)
				.join(', ')
			query += ` ORDER BY ${orderClauses}`
		}

		if (options.take) {
			query += ` LIMIT ?`
			params.push(options.take)
		}

		if (options.skip) {
			query += ` OFFSET ?`
			params.push(options.skip)
		}

		const stmt = db.prepare(query)
		const rows = stmt.all(params)
		if (!Array.isArray(rows)) return []

		return rows.map(row => this.deserializeRow(schema, row)).filter((row): row is Record<string, any> => row !== null)
	}
}
