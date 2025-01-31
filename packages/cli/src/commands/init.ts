import { generateTemplate } from '../utils/template'
import { execa } from 'execa'
import path from 'path'

export async function init() {
	try {
		console.log('CWD:', process.cwd())
		const pkg = require(path.join(process.cwd(), 'package.json'))
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
