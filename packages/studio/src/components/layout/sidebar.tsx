import * as React from "react"
import { ChevronRight, Folder, GalleryVerticalEnd } from "lucide-react"
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
import { cn } from "@/lib/utils"

type NavItem = {
  title: string
  url?: string
  items?: Omit<NavItem, 'type'>[]
}

const dataWithoutCategory: { navMain: NavItem[] } = {
  navMain: [
    {
      title: "Content",
      items: [
        { title: "Posts", url: "/posts" },
        { title: "Authors", url: "/authors" },
        { title: "Home", url: "/home" }
      ]
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
            {dataWithoutCategory.navMain.map((section) => (
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
                          className={cn(
                            "flex items-center [&.active]:bg-black/5 gap-2 py-2 px-3 rounded-md transition-colors",
                            "hover:bg-black/5",
                          )}
                        >
                          <Folder className="size-4" />
                          {item.title}
                          <ChevronRight
                            className={cn(
                              "size-4 ml-auto",
                              "text-gray-400 group-hover:text-gray-500"
                            )}
                          />
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
