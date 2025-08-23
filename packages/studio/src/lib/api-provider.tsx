import { createContext, useContext, ReactNode } from 'react'
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SnackAPIClient, QueryOptions } from './api'

const APIClientContext = createContext<SnackAPIClient | null>(null)

interface APIProviderProps {
  children: ReactNode
  client: SnackAPIClient
}

export function APIProvider({ children, client }: APIProviderProps) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <APIClientContext.Provider value={client}>
        {children}
      </APIClientContext.Provider>
    </QueryClientProvider>
  )
}

export function useAPI(): SnackAPIClient {
  const client = useContext(APIClientContext)
  if (!client) {
    throw new Error('useAPI must be used within an APIProvider')
  }
  return client
}

// TanStack Query hooks for SNACK operations
export function useSchemaQuery<T = any>(schema: string, options: QueryOptions = {}) {
  const api = useAPI()
  
  return useQuery({
    queryKey: ['schema', schema, options],
    queryFn: async () => {
      const response = await api.list<T>(schema, options)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data || []
    },
  })
}

export function useItemQuery<T = any>(schema: string, id: string | null) {
  const api = useAPI()
  
  return useQuery({
    queryKey: ['item', schema, id],
    queryFn: async () => {
      if (!id) return null
      
      const response = await api.get<T>(schema, id)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateMutation<T = any>() {
  const api = useAPI()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ schema, data }: { schema: string; data: Partial<T> }) => {
      const response = await api.create<T>(schema, data)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    },
    onSuccess: (_, { schema }) => {
      // Invalidate schema queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ['schema', schema] })
    },
  })
}

export function useUpdateMutation<T = any>() {
  const api = useAPI()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ schema, id, data }: { schema: string; id: string; data: Partial<T> }) => {
      const response = await api.update<T>(schema, id, data)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    },
    onSuccess: (_, { schema, id }) => {
      // Invalidate both the item and schema queries
      queryClient.invalidateQueries({ queryKey: ['item', schema, id] })
      queryClient.invalidateQueries({ queryKey: ['schema', schema] })
    },
  })
}

export function useDeleteMutation() {
  const api = useAPI()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ schema, id }: { schema: string; id: string }) => {
      const response = await api.delete(schema, id)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    },
    onSuccess: (_, { schema, id }) => {
      // Remove the item from cache and invalidate schema queries
      queryClient.removeQueries({ queryKey: ['item', schema, id] })
      queryClient.invalidateQueries({ queryKey: ['schema', schema] })
    },
  })
}

export function useUploadMutation() {
  const api = useAPI()
  
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await api.uploadFile(file)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    },
  })
}

// Backwards compatibility aliases
export const useQuery = useSchemaQuery
export const useItem = useItemQuery
export const useMutation = () => {
  const createMutation = useCreateMutation()
  const updateMutation = useUpdateMutation()
  const deleteMutation = useDeleteMutation()

  return {
    create: (schema: string, data: any) => 
      createMutation.mutateAsync({ schema, data }),
    update: (schema: string, id: string, data: any) => 
      updateMutation.mutateAsync({ schema, id, data }),
    remove: (schema: string, id: string) => 
      deleteMutation.mutateAsync({ schema, id }),
    loading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: createMutation.error?.message || updateMutation.error?.message || deleteMutation.error?.message || null,
  }
}