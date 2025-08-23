import type { SnackCMS } from '../types'

// Compatible request type that works with both Request and NextRequest
type CompatibleRequest = Request & {
  nextUrl?: { searchParams: URLSearchParams }
}

const createResponse = {
  json: (body: any, init?: { status?: number }) => 
    new Response(JSON.stringify(body), {
      status: init?.status || 200,
      headers: { 'Content-Type': 'application/json' }
    })
}

export interface RouteHandlerOptions {
  cms: SnackCMS
  bearerToken?: string
}

// Create a route handler that matches Next.js App Router signature
export function createRouteHandler({ cms, bearerToken }: RouteHandlerOptions) {
  return async function handler(
    request: CompatibleRequest,
    { params }: { params: Promise<{ path: string[] }> }
  ): Promise<Response> {
    // Auth check
    if (bearerToken) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader || authHeader !== `Bearer ${bearerToken}`) {
        return createResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    const { path } = await params
    
    if (!path || path.length === 0) {
      return createResponse.json(
        { error: 'Schema name is required' },
        { status: 400 }
      )
    }
    
    const [schemaName, id] = path
    
    if (!schemaName) {
      return createResponse.json(
        { error: 'Schema name is required' },
        { status: 400 }
      )
    }
    
    // Validate schema exists
    if (!cms.schemas[schemaName]) {
      return createResponse.json(
        { error: `Schema "${schemaName}" not found` },
        { status: 404 }
      )
    }

    const method = request.method
    
    try {
      // Handle different HTTP methods
      switch (method) {
        case 'GET': {
          if (id) {
            // Get single item
            const item = await cms.handlers.read(schemaName, id)
            if (!item) {
              return createResponse.json(
                { error: 'Item not found' },
                { status: 404 }
              )
            }
            return createResponse.json(item)
          } else {
            // List items with query params
            const searchParams = request.nextUrl?.searchParams || new URL(request.url).searchParams
            const limit = searchParams.get('limit')
            const offset = searchParams.get('offset')
            const orderBy = searchParams.get('orderBy')
            
            const query = {
              limit: limit ? parseInt(limit) : undefined,
              offset: offset ? parseInt(offset) : undefined,
              orderBy: orderBy || undefined
            }
            
            const items = await cms.handlers.query(schemaName, query)
            return createResponse.json(items)
          }
        }
        
        case 'POST': {
          if (id) {
            return createResponse.json(
              { error: 'POST not allowed with ID' },
              { status: 400 }
            )
          }
          const body = await request.json()
          const item = await cms.handlers.create(schemaName, body)
          return createResponse.json(item, { status: 201 })
        }
        
        case 'PUT': {
          if (!id) {
            return createResponse.json(
              { error: 'PUT requires an ID' },
              { status: 400 }
            )
          }
          const body = await request.json()
          const updated = await cms.handlers.update(schemaName, id, body)
          if (!updated) {
            return createResponse.json(
              { error: 'Item not found' },
              { status: 404 }
            )
          }
          return createResponse.json(updated)
        }
        
        case 'DELETE': {
          if (!id) {
            return createResponse.json(
              { error: 'DELETE requires an ID' },
              { status: 400 }
            )
          }
          await cms.handlers.delete(schemaName, id)
          return createResponse.json({ success: true })
        }
        
        default:
          return createResponse.json(
            { error: `Method ${method} not allowed` },
            { status: 405 }
          )
      }
    } catch (error) {
      console.error('API Error:', error)
      return createResponse.json(
        { error: error instanceof Error ? error.message : 'Internal server error' },
        { status: 500 }
      )
    }
  }
}