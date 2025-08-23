import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateMutation, useUpdateMutation } from '@/lib/api-provider'

export interface ContentFormProps {
  schema: string
  initialData?: Record<string, any>
  onSuccess?: (data: any) => void
  onCancel?: () => void
}

export function ContentForm({ 
  schema, 
  initialData = {}, 
  onSuccess, 
  onCancel 
}: ContentFormProps) {
  const [formData, setFormData] = useState(initialData)
  
  const createMutation = useCreateMutation()
  const updateMutation = useUpdateMutation()
  
  const isEdit = !!initialData.id
  const isLoading = createMutation.isPending || updateMutation.isPending
  const error = createMutation.error || updateMutation.error

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let result
      if (isEdit) {
        result = await updateMutation.mutateAsync({ 
          schema, 
          id: initialData.id, 
          data: formData 
        })
      } else {
        result = await createMutation.mutateAsync({ 
          schema, 
          data: formData 
        })
      }

      if (result && onSuccess) {
        onSuccess(result)
      }
    } catch (error) {
      // Error handling is done by TanStack Query
      console.error('Form submission error:', error)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-destructive text-sm">{error.message}</p>
        </div>
      )}

      {/* Title Field */}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter title..."
          required
          className="mt-1"
        />
      </div>

      {/* Name Field (for authors, etc.) */}
      {schema === 'author' && (
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter name..."
            required
            className="mt-1"
          />
        </div>
      )}

      {/* Email Field (for authors) */}
      {schema === 'author' && (
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter email..."
            required
            className="mt-1"
          />
        </div>
      )}

      {/* Slug Field */}
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={formData.slug || ''}
          onChange={(e) => handleChange('slug', e.target.value)}
          placeholder="enter-slug-here"
          className="mt-1 font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          URL-friendly version of the title
        </p>
      </div>

      {/* Excerpt Field (for posts) */}
      {schema === 'post' && (
        <div>
          <Label htmlFor="excerpt">Excerpt</Label>
          <textarea
            id="excerpt"
            className="w-full min-h-[80px] p-3 border border-input bg-background rounded-md resize-vertical text-sm mt-1"
            value={formData.excerpt || ''}
            onChange={(e) => handleChange('excerpt', e.target.value)}
            placeholder="Brief description of the post..."
          />
        </div>
      )}

      {/* Content Field */}
      <div>
        <Label htmlFor="content">Content</Label>
        <textarea
          id="content"
          className="w-full min-h-[200px] p-3 border border-input bg-background rounded-md resize-vertical text-sm mt-1"
          value={formData.content || ''}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="Enter content..."
        />
      </div>

      {/* Bio Field (for authors) */}
      {schema === 'author' && (
        <div>
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            className="w-full min-h-[120px] p-3 border border-input bg-background rounded-md resize-vertical text-sm mt-1"
            value={formData.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Author biography..."
          />
        </div>
      )}

      {/* Featured Toggle (for posts) */}
      {schema === 'post' && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured || false}
            onChange={(e) => handleChange('featured', e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <Label htmlFor="featured">Featured Post</Label>
        </div>
      )}

      {/* Tags Field (for posts) */}
      {schema === 'post' && (
        <div>
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={formData.tags ? formData.tags.join(', ') : ''}
            onChange={(e) => handleChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
            placeholder="tag1, tag2, tag3..."
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separate tags with commas
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEdit ? 'Update' : 'Create'
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}