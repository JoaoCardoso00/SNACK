import { SidebarInset, SidebarProvider, SidebarTrigger } from './ui/sidebar'
import { AppSidebar } from './layout/sidebar'
import { Separator } from './ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
import { Outlet, useLocation, Link } from 'react-router-dom'
import React from 'react'


function BreadcrumbNavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <BreadcrumbLink asChild>
      <Link to={to}>{children}</Link>
    </BreadcrumbLink>
  )
}

export function Studio() {
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  const nonValidPagePaths = ['blog', 'pages']

  function generateBreadcrumbs() {
    if (pathSegments.length === 0) return null

    return (
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbNavLink to="/">Home</BreadcrumbNavLink>
        </BreadcrumbItem>
        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join('/')}`

          const isLast = index === pathSegments.length - 1

          const isNotValidPage = nonValidPagePaths.includes(segment)

          return (
            <React.Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>
                    <span className="capitalize">{segment}</span>
                  </BreadcrumbPage>
                ) :
                  isNotValidPage ? (
                    <BreadcrumbItem>
                      <span className="capitalize">{segment}</span>
                    </BreadcrumbItem>
                  ) :
                    (
                      <BreadcrumbNavLink to={path}>
                        <span className="capitalize">{segment}</span>
                      </BreadcrumbNavLink>
                    )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    )
  }

  return (
    <SidebarProvider style={{ '--sidebar-width': '19rem' } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            {generateBreadcrumbs()}
          </Breadcrumb>
        </header>
        <main className='p-5'>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
