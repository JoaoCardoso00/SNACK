import { z } from 'zod'
import type { SnackSchema, SchemaField } from '../types/schema'

function createFieldValidator(field: SchemaField) {
	switch (field.type) {
		case 'string':
			return z.string()
		case 'number':
			return z.number()
		case 'boolean':
			return z.boolean()
		default:
			throw new Error(`Unknown field type: ${field.type}`)
	}
}

export function createSchemaValidator(schema: SnackSchema) {
	const fields = schema.fields.reduce((acc, field) => {
		acc[field.name] = createFieldValidator(field)
		return acc
	}, {} as Record<string, z.ZodType>)

	return z.object(fields)
}
