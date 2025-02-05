import { createBrowserRouter, createMemoryRouter, RouterProvider } from 'react-router-dom'
import { Studio } from '@/components/studio'
import { Dashboard } from '@/components/pages/dashboard'
import { DocumentList } from '@/components/pages/document-list'

const routes = [{
  element: <Studio />,
  children: [
    { path: '/', element: <Dashboard /> },
    { path: '/:document', element: <DocumentList /> },
    { path: '/:category/:document', element: <DocumentList /> },
  ]
}]

export function StudioRouter({ segments }: { segments?: string[] }) {
  const router = segments
    ? createMemoryRouter(routes, { initialEntries: [segments.join('/')] })
    : createBrowserRouter(routes)

  return <RouterProvider router={router} />
}
