import path from 'path'
import { execa } from 'execa'
import fs from 'fs/promises'

export async function add(feature: string) {
	switch (feature) {
		case 'studio':
			await addStudio()
			break
		default:
			console.error(`❌ Unknown feature: ${feature}`)
			process.exit(1)
	}
}

async function addStudio() {
	// Install dependencies
	await execa('pnpm', ['add', '@snack/studio'])

	// Create studio page
	const studioDir = path.join(process.cwd(), 'app/studio')
	await fs.mkdir(studioDir, { recursive: true })

	await fs.writeFile(
		path.join(studioDir, 'page.tsx'),
		`import { SnackStudio } from '@snack/studio'

export default function StudioPage() {
  return <SnackStudio />
}
`)

	console.log(`
✨ Studio added successfully

Next steps:
  1. Run your Next.js development server
  2. Visit your studio page at /studio
  3. Start managing your content
`)
}
