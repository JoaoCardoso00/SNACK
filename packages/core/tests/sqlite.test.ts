import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { SnackCMS } from '../src/types'
import { init } from '../src/index'

describe('SNACK Core', () => {
	let cms: SnackCMS

	beforeAll(async () => {
		cms = await init({
			schemas: {
				posts: {
					name: 'Posts',
					fields: [
						{ name: 'title', type: 'string', required: true },
						{ name: 'content', type: 'string' },
						{ name: 'published', type: 'boolean', defaultValue: false }
					]
				}
			},
			storage: {
				sqlite: {
					dbPath: ':memory:',
					verbose: false
				}
			}
		})
	})

	afterAll(async () => {
		await cms.storage.disconnect()
	})

	describe('CRUD Operations', () => {
		let postId: string

		it('should create a post', async () => {
			const post = await cms.handlers.create('posts', {
				title: 'Test Post',
				content: 'This is a test',
				published: true
			})

			expect(post).toBeDefined()
			expect(post.id).toBeDefined()
			expect(post.title).toBe('Test Post')
			expect(post.content).toBe('This is a test')
			expect(post.published).toBe(true)

			postId = post.id
		})

		it('should read a post', async () => {
			const post = await cms.handlers.read('posts', postId)
			expect(post).toBeDefined()
			expect(post.id).toBe(postId)
			expect(post.title).toBe('Test Post')
		})

		it('should update a post', async () => {
			const updated = await cms.handlers.update('posts', postId, {
				title: 'Updated Title',
				content: 'Updated content'
			})

			expect(updated).toBeDefined()
			expect(updated.id).toBe(postId)
			expect(updated.title).toBe('Updated Title')
			expect(updated.content).toBe('Updated content')
		})

		it('should query posts', async () => {
			const posts = await cms.handlers.query('posts', {
				where: { published: true }
			})

			expect(Array.isArray(posts)).toBe(true)
			expect(posts.length).toBeGreaterThan(0)
			expect(posts[0].published).toBe(true)
		})

		it('should delete a post', async () => {
			await cms.handlers.delete('posts', postId)
			const post = await cms.handlers.read('posts', postId)
			expect(post).toBeNull()
		})
	})

	describe('Schema Validation', () => {
		it('should enforce required fields', async () => {
			await expect(
				cms.handlers.create('posts', {
					content: 'Missing title',
					published: false
				})
			).rejects.toThrow()
		})

		it('should handle default values', async () => {
			const post = await cms.handlers.create('posts', {
				title: 'Default Test',
				content: 'Testing defaults'
			})

			expect(post.published).toBe(false)
		})
	})
})
