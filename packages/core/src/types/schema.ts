export type SnackSchema = {
	name: string
	fields: SchemaField[]
	options?: SchemaOptions
}

export type SchemaField = {
	name: string
	type: FieldType
	required?: boolean
	unique?: boolean
	defaultValue?: any
	validate?: (value: any) => boolean | Promise<boolean>
}

export type FieldType =
	| 'string'
	| 'number'
	| 'boolean'
	| 'date'
	| 'json'
	| 'reference'
	| 'media'
	| 'array'
	| 'enum'

export type SchemaOptions = {
	timestamps?: boolean
	softDelete?: boolean
	versioning?: boolean
}
