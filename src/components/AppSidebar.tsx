
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LogIn, UserPlus, LayoutDashboard, Code2, Kanban, MessageSquare } from "lucide-react";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Code Editor",
    url: "/editor",
    icon: Code2,
  },
  {
    title: "Kanban Board",
    url: "/kanban",
    icon: Kanban,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: MessageSquare,
  },
];

const authItems = [
  {
    title: "Login",
    url: "/login",
    icon: LogIn,
  },
  {
    title: "Register",
    url: "/register",
    icon: UserPlus,
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="h-screen border-r bg-sidebar-DEFAULT text-sidebar-foreground min-w-[220px] max-w-[260px]">
      <SidebarContent className="h-full flex flex-col">
        <div className="px-6 pt-8 pb-4 flex items-center space-x-2">
          <span className="font-bold text-xl tracking-tight text-primary">DevSync</span>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition text-[15px]">
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {authItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition text-[15px]">
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

