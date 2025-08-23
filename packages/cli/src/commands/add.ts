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
	// Create studio page with catch-all routes
	const studioDir = path.join(process.cwd(), 'app/studio/[[...path]]')
	await fs.mkdir(studioDir, { recursive: true })

	await fs.writeFile(
		path.join(studioDir, 'page.tsx'),
		`'use client'

import { StudioRouter } from '@snack/studio'
import '@snack/studio/dist/index.css'

export default function StudioPage() {
  return (
    <div className="min-h-screen">
      <StudioRouter />
    </div>
  )
}
`)

	console.log(`
✨ Studio added successfully!

Next steps:
  1. Set SNACK_API_TOKEN in .env.local (optional for auth)
  2. Run: npm run dev (or pnpm dev)
  3. Visit: http://localhost:3000/studio
  4. Start managing your content!

Studio features:
  - Create, edit, and delete content
  - Browse all your schemas
  - Type-safe forms
  - Real-time updates
`)
}
