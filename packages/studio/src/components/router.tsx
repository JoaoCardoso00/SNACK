import { createBrowserRouter, createMemoryRouter, RouterProvider } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Studio } from '@/components/studio'
import { Dashboard } from '@/components/pages/dashboard'
import { DocumentList } from '@/components/pages/document-list'
import { NotFound } from './pages/not-found'

const routes = [{
  element: <Studio />,
  errorElement: <NotFound />,
  children: [
    { path: '/', element: <Dashboard /> },
    { path: '/:document', element: <DocumentList /> },
    { path: '/:category/:document', element: <DocumentList /> },
  ],
}]

export function StudioRouter({ segments }: { segments?: string[] }) {
  const [router, setRouter] = useState<any>(null)

  useEffect(() => {
    // Only create browser router on client side
    const newRouter = segments
      ? createMemoryRouter(routes, { initialEntries: [segments.join('/')] })
      : createBrowserRouter(routes)
    setRouter(newRouter)
  }, [segments])

  // Show loading until router is ready
  if (!router) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading Studio...</div>
      </div>
    )
  }

  return <RouterProvider router={router} />
}
