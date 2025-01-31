import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { SnackCMS } from '../src/types'
import { createCMS } from '../src/index'

describe('SNACK Core', () => {
	let cms: SnackCMS

	beforeAll(async () => {
		cms = await createCMS({
			schemas: {
				posts: {
					name: 'Posts',
					fields: [
						{ name: 'title', type: 'string', required: true },
						{ name: 'content', type: 'string' },
						{ name: 'published', type: 'boolean', defaultValue: false }
					]
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
			expect(post.created_at).toBeDefined()
			expect(post.updated_at).toBeDefined()

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
			expect(updated.updated_at).not.toBe(updated.created_at)
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

	describe('Storage Operations', () => {
		it('should handle JSON fields correctly', async () => {
			// First, let's create a new schema with a JSON field
			await cms.storage.prepareSchema('articles', [
				{ name: 'title', type: 'string', required: true },
				{ name: 'metadata', type: 'json' }
			])

			const metadata = {
				tags: ['test', 'json'],
				views: 0,
				settings: { isPublic: true }
			}

			const article = await cms.handlers.create('articles', {
				title: 'JSON Test',
				metadata
			})

			expect(article.metadata).toEqual(metadata)

			// Read it back to ensure it was stored correctly
			const retrieved = await cms.handlers.read('articles', article.id)
			expect(retrieved.metadata).toEqual(metadata)
		})

		it('should handle date fields correctly', async () => {
			// Create a new schema with a date field
			await cms.storage.prepareSchema('events', [
				{ name: 'title', type: 'string', required: true },
				{ name: 'eventDate', type: 'date' }
			])

			const date = new Date()
			const event = await cms.handlers.create('events', {
				title: 'Date Test',
				eventDate: date
			})

			expect(event.eventDate).toBeInstanceOf(Date)
			expect(event.eventDate.toISOString()).toBe(date.toISOString())

			// Read it back to ensure it was stored correctly
			const retrieved = await cms.handlers.read('events', event.id)
			expect(retrieved.eventDate).toBeInstanceOf(Date)
			expect(retrieved.eventDate.toISOString()).toBe(date.toISOString())
		})
	})
})
