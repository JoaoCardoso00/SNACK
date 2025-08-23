// API client for SNACK CMS operations
export interface APIClientOptions {
  baseUrl: string
  apiToken?: string
}

export interface APIResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: string
  order?: 'asc' | 'desc'
}

export class SnackAPIClient {
  private baseUrl: string
  private apiToken?: string

  constructor(options: APIClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.apiToken = options.apiToken
  }

  private async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (this.apiToken) {
      headers.Authorization = `Bearer ${this.apiToken}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
        }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  // List all items for a schema
  async list<T = any>(schema: string, options: QueryOptions = {}): Promise<APIResponse<T[]>> {
    const params = new URLSearchParams()
    
    if (options.limit) params.set('limit', options.limit.toString())
    if (options.offset) params.set('offset', options.offset.toString())
    if (options.orderBy) params.set('orderBy', options.orderBy)
    if (options.order) params.set('order', options.order)

    const query = params.toString()
    const endpoint = `/api/snack/${schema}${query ? `?${query}` : ''}`
    
    return this.request<T[]>(endpoint)
  }

  // Get single item by ID
  async get<T = any>(schema: string, id: string): Promise<APIResponse<T>> {
    return this.request<T>(`/api/snack/${schema}/${id}`)
  }

  // Create new item
  async create<T = any>(schema: string, data: Partial<T>): Promise<APIResponse<T>> {
    return this.request<T>(`/api/snack/${schema}`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Update existing item
  async update<T = any>(schema: string, id: string, data: Partial<T>): Promise<APIResponse<T>> {
    return this.request<T>(`/api/snack/${schema}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Delete item
  async delete(schema: string, id: string): Promise<APIResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`/api/snack/${schema}/${id}`, {
      method: 'DELETE'
    })
  }

  // Upload file
  async uploadFile(file: File): Promise<APIResponse<{ url: string; filename: string }>> {
    const formData = new FormData()
    formData.append('file', file)

    const headers: HeadersInit = {}
    if (this.apiToken) {
      headers.Authorization = `Bearer ${this.apiToken}`
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/snack/upload`, {
        method: 'POST',
        headers,
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          error: errorData.error || `Upload failed: ${response.status}`
        }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Upload error'
      }
    }
  }
}