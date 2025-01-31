import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdir, writeFile, rm, readFile, readdir } from 'fs/promises'
import { create } from '../src/commands/create'
import { init } from '../src/commands/init'
import { add } from '../src/commands/add'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TMP_DIR = path.join(__dirname, 'tmp')

vi.mock('execa', () => ({
	execa: vi.fn().mockResolvedValue({ exitCode: 0 })
}))

vi.mock('prompts', () => ({
	default: vi.fn().mockResolvedValue({ projectName: 'test-app' })
}))

describe('SNACK CLI', () => {
	beforeEach(async () => {
		await mkdir(TMP_DIR, { recursive: true })
		process.chdir(TMP_DIR)
		vi.spyOn(process, 'exit').mockImplementation(() => {
			return undefined as never;
		});
	})

	afterEach(async () => {
		await rm(TMP_DIR, { recursive: true, force: true })
		vi.clearAllMocks()
	})

	describe('create command', () => {
		it('should create a new project with the correct structure', async () => {
			await create('test-app')

			const hasApiRoute = await exists(path.join(TMP_DIR, 'test-app/app/api/snack/[collection]/route.ts'))
			const hasSchema = await exists(path.join(TMP_DIR, 'test-app/schemas/index.ts'))

			expect(hasApiRoute).toBe(true)
			expect(hasSchema).toBe(true)
		})
	})

	describe('init command', () => {
		it('should initialize SNACK in an existing Next.js project', async () => {
			const nextProjectPath = path.join(TMP_DIR, 'mock-next')
			await mkdir(nextProjectPath, { recursive: true })
			await writeFile(
				path.join(nextProjectPath, 'package.json'),
				JSON.stringify({ dependencies: { next: '^14.0.0' } })
			)
			process.chdir(nextProjectPath)

			await init()
			const schemaPath = path.join(nextProjectPath, 'schemas')
			const exists = await readdir(schemaPath).catch(() => false)
			expect(exists).not.toBe(false)
		})

		it('should fail in non-Next.js project', async () => {
			await init()
			expect(process.exit).toHaveBeenCalledWith(1)
		})
	})

	describe('add command', () => {
		it('should add studio feature', async () => {
			await mkdir('mock-next', { recursive: true })
			process.chdir('mock-next')

			await add('studio')

			const hasStudioPage = await exists('app/studio/page.tsx')
			expect(hasStudioPage).toBe(true)
		})

		it('should fail for unknown feature', async () => {
			await add('unknown')
			expect(process.exit).toHaveBeenCalledWith(1)
		})
	})
})

async function exists(filepath: string) {
	try {
		await readFile(filepath)
		return true
	} catch {
		return false
	}
}
