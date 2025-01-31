import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

type TemplateConfig = {
	name: string
	schemas: any[]
}

export async function generateTemplate(dir: string, config: TemplateConfig) {
	await mkdir(path.join(dir, 'app/api/snack/[collection]'), { recursive: true })
	await mkdir(path.join(dir, 'schemas'), { recursive: true })

	await writeFile(
		path.join(dir, 'app/api/snack/[collection]/route.ts'),
		`import { createRouteHandler } from '@snack/core/routes'
import { schemas } from '@/schemas'

export const { GET, POST, PUT, DELETE } = createRouteHandler({
 schemas
})`
	)

	await writeFile(
		path.join(dir, 'schemas/index.ts'),
		`import { defineSchema } from '@snack/core'

export const schemas = {
 posts: defineSchema({
   name: 'Posts',
   fields: [
     { name: 'title', type: 'string', required: true },
     { name: 'content', type: 'string' }
   ]
 })
}`
	)
}
