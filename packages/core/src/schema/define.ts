// Type helpers for better inference
type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'slug' | 'text' | 
                 'url' | 'email' | 'image' | 'file' | 'reference' | 'array' | 'object'

interface BaseField {
  name: string
  title?: string
  description?: string
  required?: boolean
  readonly?: boolean
  hidden?: boolean
  initialValue?: any
}

interface StringField extends BaseField {
  type: 'string' | 'text' | 'slug' | 'url' | 'email'
  options?: {
    list?: { title: string; value: string }[]
    layout?: 'radio' | 'dropdown'
    maxLength?: number
    minLength?: number
  }
  validation?: (value: string) => boolean | string
}

interface NumberField extends BaseField {
  type: 'number'
  options?: {
    min?: number
    max?: number
    step?: number
  }
  validation?: (value: number) => boolean | string
}

interface BooleanField extends BaseField {
  type: 'boolean'
  options?: {
    layout?: 'checkbox' | 'switch'
  }
}

interface DateField extends BaseField {
  type: 'date' | 'datetime'
  options?: {
    dateFormat?: string
    timeFormat?: string
  }
}

interface ImageField extends BaseField {
  type: 'image'
  options?: {
    accept?: string[]
    maxSize?: number // in bytes
    storeOriginalFilename?: boolean
  }
}

interface FileField extends BaseField {
  type: 'file'
  options?: {
    accept?: string[]
    maxSize?: number
    storeOriginalFilename?: boolean
  }
}

interface ReferenceField extends BaseField {
  type: 'reference'
  to: string | string[]
  options?: {
    disableNew?: boolean
    filter?: string
  }
}

interface ArrayField extends BaseField {
  type: 'array'
  of: Field[]
  options?: {
    layout?: 'tags' | 'grid'
    sortable?: boolean
  }
}

interface ObjectField extends BaseField {
  type: 'object'
  fields: Field[]
  options?: {
    collapsible?: boolean
    collapsed?: boolean
  }
}

type Field = StringField | NumberField | BooleanField | DateField | 
             ImageField | FileField | ReferenceField | ArrayField | ObjectField

// Export FieldType for external use
export type { FieldType }

export interface DocumentSchema {
  name: string
  title?: string
  type: 'document'
  icon?: any // React component or icon name
  fields: Field[]
  preview?: {
    select?: Record<string, string>
    prepare?: (selection: any) => {
      title?: string
      subtitle?: string
      media?: any
    }
  }
  orderings?: Array<{
    title: string
    name: string
    by: Array<{ field: string; direction: 'asc' | 'desc' }>
  }>
  initialValue?: () => any
  validation?: (document: any) => boolean | string
}

/**
 * Convert field types from defineSchema to internal schema types
 */
function convertFieldType(field: Field): import('../types/schema').SchemaField {
  let type: import('../types/schema').FieldType
  
  switch (field.type) {
    case 'string':
    case 'text':
    case 'slug':
    case 'url':
    case 'email':
      type = 'string'
      break
    case 'number':
      type = 'number'
      break
    case 'boolean':
      type = 'boolean'
      break
    case 'date':
    case 'datetime':
      type = 'date'
      break
    case 'image':
    case 'file':
      type = 'media'
      break
    case 'reference':
      type = 'reference'
      break
    case 'array':
      type = 'array'
      break
    case 'object':
      type = 'json'
      break
    default:
      type = 'string'
  }
  
  return {
    name: field.name,
    type,
    required: field.required || false,
    unique: false, // TODO: add unique support to Field type
    defaultValue: field.initialValue,
    validate: ('validation' in field) ? field.validation as any : undefined
  }
}

/**
 * Convert DocumentSchema to internal SnackSchema
 */
export function convertDocumentSchema(schema: DocumentSchema): import('../types/schema').SnackSchema {
  return {
    name: schema.name,
    fields: schema.fields.map(convertFieldType),
    options: {
      timestamps: true,
      softDelete: false,
      versioning: false
    }
  }
}

/**
 * Define a document schema with Sanity-like syntax
 */
export function defineType(schema: DocumentSchema): DocumentSchema {
  return schema
}

/**
 * Field builder helpers for better DX
 */
export function defineField<T extends Field>(field: T): T {
  return field
}

/**
 * Common field presets
 */
export const fields = {
  // Text fields
  string: (name: string, title?: string): StringField => ({
    name,
    title: title || name,
    type: 'string'
  }),
  
  text: (name: string, title?: string): StringField => ({
    name,
    title: title || name,
    type: 'text'
  }),
  
  slug: (name: string, options?: { source?: string }): StringField => ({
    name,
    title: 'Slug',
    type: 'slug',
    options: options as any
  }),
  
  url: (name: string, title?: string): StringField => ({
    name,
    title: title || name,
    type: 'url'
  }),
  
  email: (name: string, title?: string): StringField => ({
    name,
    title: title || name,
    type: 'email'
  }),
  
  // Number fields
  number: (name: string, title?: string): NumberField => ({
    name,
    title: title || name,
    type: 'number'
  }),
  
  // Boolean fields
  boolean: (name: string, title?: string): BooleanField => ({
    name,
    title: title || name,
    type: 'boolean'
  }),
  
  // Date fields
  date: (name: string, title?: string): DateField => ({
    name,
    title: title || name,
    type: 'date'
  }),
  
  datetime: (name: string, title?: string): DateField => ({
    name,
    title: title || name,
    type: 'datetime'
  }),
  
  // Media fields
  image: (name: string, title?: string): ImageField => ({
    name,
    title: title || name,
    type: 'image'
  }),
  
  file: (name: string, title?: string): FileField => ({
    name,
    title: title || name,
    type: 'file'
  }),
  
  // Reference field
  reference: (name: string, to: string | string[]): ReferenceField => ({
    name,
    title: 'Reference',
    type: 'reference',
    to
  }),
  
  // Complex fields
  array: (name: string, of: Field[]): ArrayField => ({
    name,
    title: name,
    type: 'array',
    of
  }),
  
  object: (name: string, fields: Field[]): ObjectField => ({
    name,
    title: name,
    type: 'object',
    fields
  })
}

/**
 * Example usage:
 * 
 * export const post = defineType({
 *   name: 'post',
 *   title: 'Blog Post',
 *   type: 'document',
 *   fields: [
 *     defineField({
 *       name: 'title',
 *       title: 'Title',
 *       type: 'string',
 *       required: true,
 *       validation: (value) => value.length > 0 || 'Title is required'
 *     }),
 *     defineField({
 *       name: 'slug',
 *       title: 'Slug',
 *       type: 'slug',
 *       options: {
 *         source: 'title'
 *       }
 *     }),
 *     defineField({
 *       name: 'author',
 *       title: 'Author',
 *       type: 'reference',
 *       to: 'author'
 *     }),
 *     defineField({
 *       name: 'content',
 *       title: 'Content',
 *       type: 'array',
 *       of: [
 *         { type: 'text' },
 *         { type: 'image' }
 *       ]
 *     })
 *   ],
 *   preview: {
 *     select: {
 *       title: 'title',
 *       author: 'author.name',
 *       media: 'mainImage'
 *     }
 *   }
 * })
 */