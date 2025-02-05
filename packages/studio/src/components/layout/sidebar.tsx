import * as React from "react"
import { GalleryVerticalEnd } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { NavLink } from "react-router-dom"

type NavItem = {
  type: 'category' | 'item'
  title: string
  url?: string
  items?: Omit<NavItem, 'type'>[]
}

const data: { navMain: NavItem[] } = {
  navMain: [
    {
      type: 'category',
      title: "Blog",
      items: [
        { title: "Posts", url: "/blog/posts" },
        { title: "Authors", url: "/blog/authors" }
      ]
    },
    {
      type: 'category',
      title: "Pages",
      items: [
        { title: "Home", url: "/pages/home" }
      ]
    },
    {
      type: 'item',
      title: "Settings",
      url: "/settings"
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">SNACK Studio</span>
                  <span className="">alpha</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((section) => {
              if (section.type === 'item') {
                return (
                  <SidebarMenuItem key={section.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={section.url!}
                        className={({ isActive }) => isActive ? 'active' : ''}
                      >
                        {section.title}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              }

              return (
                <SidebarMenuItem key={section.title}>
                  <SidebarMenuButton className="font-medium">
                    {section.title}
                  </SidebarMenuButton>
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {section.items?.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild>
                          <NavLink
                            to={item.url!}
                            className={({ isActive }) => isActive ? 'active' : ''}
                          >
                            {item.title}
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
