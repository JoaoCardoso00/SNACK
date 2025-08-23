import { useParams } from "react-router-dom"
import { Button } from '@/components/ui/button'
import { useSchemaQuery, useCreateMutation, useDeleteMutation } from '@/lib/api-provider'
import { useState } from 'react'
import { ContentForm } from '@/components/forms/content-form'
import { Trash2 } from 'lucide-react'

export function DocumentList() {
  const { document } = useParams()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const validTypes = ['posts', 'authors', 'post', 'author']

  if (!document || !validTypes.includes(document)) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-muted-foreground">Invalid document type</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Valid types: {validTypes.join(', ')}
          </p>
        </div>
      </div>
    )
  }

  // Normalize schema name (remove 's' if plural)
  const schemaName = document.endsWith('s') ? document.slice(0, -1) : document
  
  const { data: items, isLoading, error, refetch } = useSchemaQuery(schemaName)
  const deleteMutation = useDeleteMutation()

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMutation.mutateAsync({ schema: schemaName, id })
      } catch (error) {
        console.error('Failed to delete:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <h3 className="font-semibold text-destructive">Error loading {document}</h3>
          <p className="text-sm text-destructive/80 mt-1">{error.message}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="mt-3"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (showCreateForm || editingItem) {
    return (
      <div className="p-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">
            {editingItem ? `Edit ${schemaName}` : `Create ${schemaName}`}
          </h1>
          
          <ContentForm
            schema={schemaName}
            initialData={editingItem}
            onSuccess={(data) => {
              setShowCreateForm(false)
              setEditingItem(null)
              // TanStack Query will automatically update the cache
            }}
            onCancel={() => {
              setShowCreateForm(false)
              setEditingItem(null)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold capitalize">{document}</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          Create {schemaName}
        </Button>
      </div>

      {!items || items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <p className="text-lg font-semibold">No {document} found</p>
            <p className="text-sm mt-2">Create your first {schemaName} to get started.</p>
            <Button 
              className="mt-4" 
              onClick={() => setShowCreateForm(true)}
              variant="outline"
            >
              Create {schemaName}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item: any) => (
            <div 
              key={item.id} 
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {item.title || item.name || `${schemaName} ${item.id}`}
                  </h3>
                  {item.excerpt && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {item.excerpt}
                    </p>
                  )}
                  {item.email && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.email}
                    </p>
                  )}
                  <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                    {item.created_at && (
                      <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                    )}
                    {item.updated_at && item.updated_at !== item.created_at && (
                      <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingItem(item)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleteMutation.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    {deleteMutation.isPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}