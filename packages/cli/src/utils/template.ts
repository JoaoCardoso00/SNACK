import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

type TemplateConfig = {
	name: string
	schemas?: any[]
}

export async function generateTemplate(dir: string, config: TemplateConfig) {
	// Create all necessary directories
	await mkdir(path.join(dir, 'app/api/snack/[...path]'), { recursive: true })
	await mkdir(path.join(dir, 'lib/snack/schemas'), { recursive: true })
	await mkdir(path.join(dir, 'lib/snack/config'), { recursive: true })
	await mkdir(path.join(dir, 'public/uploads'), { recursive: true })

	// API Route Handler
	await writeFile(
		path.join(dir, 'app/api/snack/[...path]/route.ts'),
		`import { createRouteHandler } from '@snack/core'
import { getCMS } from '@/lib/snack/config/cms'

// Create handlers for each HTTP method  
async function createHandler(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const cms = await getCMS()
  const handler = createRouteHandler({
    cms,
    bearerToken: process.env.SNACK_API_TOKEN
  })
  return handler(request, context)
}

export { 
  createHandler as GET,
  createHandler as POST,
  createHandler as PUT,
  createHandler as DELETE
}`
	)

	// CMS Configuration
	await writeFile(
		path.join(dir, 'lib/snack/config/cms.ts'),
		`import { createCMS, convertDocumentSchema, type SnackCMS } from '@snack/core'
import { schemas } from '../schemas'

// Initialize CMS (this will be cached)
let cmsInstance: SnackCMS | null = null

export async function getCMS() {
  if (!cmsInstance) {
    cmsInstance = await createCMS({
      schemas: Object.fromEntries(
        schemas.map(schema => [schema.name, convertDocumentSchema(schema)])
      )
    })
  }
  return cmsInstance
}`
	)

	// Schema Index
	await writeFile(
		path.join(dir, 'lib/snack/schemas/index.ts'),
		`import { post } from './post'
import { author } from './author'

// Export all your schemas here
export const schemas = [
  post,
  author
]`
	)

	// Example Post Schema (Sanity-like)
	await writeFile(
		path.join(dir, 'lib/snack/schemas/post.ts'),
		`import { defineType, defineField } from '@snack/core'

export const post = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      required: true,
      validation: (value) => {
        if (!value || value.length === 0) return 'Title is required'
        if (value.length > 100) return 'Title must be less than 100 characters'
        return true
      }
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      required: true,
      options: {
        source: 'title',
        maxLength: 96
      }
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: 'author',
      required: true
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        accept: ['image/jpeg', 'image/png', 'image/webp'],
        maxSize: 5 * 1024 * 1024 // 5MB
      }
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'Brief description of the post',
      options: {
        maxLength: 200
      }
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        { name: 'paragraph', type: 'text' },
        { 
          name: 'image',
          type: 'image',
          options: {
            accept: ['image/jpeg', 'image/png', 'image/webp']
          }
        },
        {
          name: 'code',
          type: 'object',
          title: 'Code Block',
          fields: [
            {
              name: 'language',
              type: 'string',
              options: {
                list: [
                  { title: 'JavaScript', value: 'javascript' },
                  { title: 'TypeScript', value: 'typescript' },
                  { title: 'CSS', value: 'css' },
                  { title: 'HTML', value: 'html' }
                ]
              }
            },
            {
              name: 'code',
              type: 'text'
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime'
    }),
    defineField({
      name: 'featured',
      title: 'Featured Post',
      type: 'boolean',
      initialValue: false,
      options: {
        layout: 'switch'
      }
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ name: 'tag', type: 'string' }],
      options: {
        layout: 'tags'
      }
    })
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage'
    },
    prepare(selection) {
      const { author } = selection
      return {
        ...selection,
        subtitle: author ? \`by \${author}\` : 'No author'
      }
    }
  },
  orderings: [
    {
      title: 'Publish Date, New',
      name: 'publishDateDesc',
      by: [
        { field: 'publishedAt', direction: 'desc' }
      ]
    },
    {
      title: 'Publish Date, Old',
      name: 'publishDateAsc',
      by: [
        { field: 'publishedAt', direction: 'asc' }
      ]
    }
  ]
})`
	)

	// Example Author Schema
	await writeFile(
		path.join(dir, 'lib/snack/schemas/author.ts'),
		`import { defineType, defineField } from '@snack/core'

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      required: true
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96
      }
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'email',
      required: true
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image'
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text'
    }),
    defineField({
      name: 'social',
      title: 'Social Links',
      type: 'object',
      fields: [
        {
          name: 'twitter',
          title: 'Twitter',
          type: 'url'
        },
        {
          name: 'github',
          title: 'GitHub',
          type: 'url'
        },
        {
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url'
        }
      ]
    })
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      subtitle: 'email'
    }
  }
})`
	)

	// Environment variables template
	await writeFile(
		path.join(dir, '.env.local'),
		`# Snack Configuration
SNACK_API_TOKEN=your-secret-token-here

# Database
SNACK_DB_PATH=./snack.db

# Uploads
NEXT_PUBLIC_UPLOAD_URL=/uploads`,
		{ flag: 'wx' } // Don't overwrite if exists
	).catch(() => {
		// File already exists, that's fine
	})

	// TypeScript types for better DX
	await writeFile(
		path.join(dir, 'lib/snack/types.ts'),
		`// Auto-generated types from your schemas
import type { post } from './schemas/post'
import type { author } from './schemas/author'

// Infer types from schemas
export type Post = typeof post
export type Author = typeof author

// API Response types
export interface APIResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}`
	)

	console.log('✅ SNACK initialized successfully!')
	console.log('\nNext steps:')
	console.log('1. Update your schemas in lib/snack/schemas/')
	console.log('2. Set SNACK_API_TOKEN in .env.local (optional)')
	console.log('3. Run your Next.js app and access the API at /api/snack/')
	console.log('\nExample API calls:')
	console.log('  GET    /api/snack/post')
	console.log('  GET    /api/snack/post/[id]')
	console.log('  POST   /api/snack/post')
	console.log('  PUT    /api/snack/post/[id]')
	console.log('  DELETE /api/snack/post/[id]')
}