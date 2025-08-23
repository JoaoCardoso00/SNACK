import { generateTemplate } from '../utils/template'
import { execa } from 'execa'
import path from 'path'
import { readFile } from 'fs/promises'

export async function init() {
	try {
		console.log('CWD:', process.cwd())
		const pkgContent = await readFile(path.join(process.cwd(), 'package.json'), 'utf-8')
		const pkg = JSON.parse(pkgContent)
		if (!pkg.dependencies?.['next']) throw new Error('Not Next.js project')

		await generateTemplate(process.cwd(), {
			name: path.basename(process.cwd()),
			schemas: []
		})
	} catch (error) {
		console.error('Error:', error)
		process.exit(1)
	}
}
