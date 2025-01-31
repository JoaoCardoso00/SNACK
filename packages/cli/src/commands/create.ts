import path from 'path'
import { execa } from 'execa'
import prompts from 'prompts'
import { generateTemplate } from '../utils/template'

export async function create(name?: string) {
	const { projectName } = await prompts({
		type: 'text',
		name: 'projectName',
		message: 'What is your project named?',
		initial: name || 'my-snack-app'
	})

	const projectDir = path.resolve(process.cwd(), projectName)

	// Create Next.js project
	await execa('pnpm', ['create', 'next-app', projectName, '--typescript', '--tailwind', '--app', '--src-dir', '--import-alias', '@/*'])

	// Generate SNACK templates
	await generateTemplate(projectDir, {
		name: projectName,
		schemas: []
	})

	// Install dependencies
	await execa('pnpm', ['add', '@snack/core'], { cwd: projectDir })

	console.log(`
✨ SNACK project created at ${projectName}

Next steps:
  cd ${projectName}
  pnpm dev
`)
}
