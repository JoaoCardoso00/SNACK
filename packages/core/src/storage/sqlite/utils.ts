import type { SchemaField, FieldType } from '../../types'

export function getSQLiteType(fieldType: FieldType): string {
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
			return 'TEXT' // Store as UUID/ID string
		default:
			return 'TEXT'
	}
}

export function createTableQuery(tableName: string, fields: SchemaField[]): string {
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

	return `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      ${fieldDefinitions.join(',\n      ')}
    )
  `
}
