"use client";

import {
  Activity,
  BarChart,
  Building,
  Calendar,
  Contact2,
  Home,
  Lightbulb,
  LineChart,
  Logs,
  Mail,
  Package,
  Podcast,
  Settings,
  Target,
  User2,
  Users2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "../ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const sidebarGroupItems = [
  {
    title: "Main",
    items: [
      {
        title: "Home",
        url: "/dashboard",
        icon: Home,
      },
      {
        title: "Users",
        url: "/dashboard/users",
        icon: User2,
      },
    ],
  },
  {
    title: "Tenant",
    items: [
      {
        title: "Organizations",
        url: "/dashboard/organizations",
        icon: Building,
      },
      {
        title: "Team Members",
        url: "/dashboard/members",
        icon: Users2,
      },
      {
        title: "Subscriptions",
        url: "/dashboard/subscriptions",
        icon: Podcast,
      },
    ],
  },
  {
    title: "Core",
    items: [
      {
        title: "Contacts",
        url: "/dashboard/contacts",
        icon: Contact2,
      },
      {
        title: "Lead",
        url: "/dashboard/deals",
        icon: Target,
      },
      {
        title: "Opportunities",
        url: "/dashboard/opportunities",
        icon: Lightbulb,
      },
      {
        title: "Product",
        url: "/dashboard/products",
        icon: Package,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Activity",
        url: "/dashboard/activity",
        icon: Activity,
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        title: "Email",
        url: "/dashboard/emails",
        icon: Mail,
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        title: "Calendar",
        url: "/dashboard/calendar",
        icon: Calendar,
      },
      {
        title: "Reports",
        url: "/dashboard/reports",
        icon: BarChart,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: LineChart,
      },
    ],
  },
  {
    title: "Application",
    items: [
      {
        title: "Logs",
        url: "/dashboard/logs",
        icon: Logs,
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

const AppSidebar = () => {
  const pathname = usePathname();

  const { data: session } = authClient.useSession();

  const filteredGroupItems = sidebarGroupItems.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      // Hide Users menu for non-admin/manager users
      if (item.title === "Users") {
        return (
          session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER"
        );
      }
      return true;
    }),
  }));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard">
                <Image src={"/side.svg"} alt="logo" width={40} height={40} />
                <span>O-CRM</span>
                <span
                  className={cn(
                    "text-[9px] p-1 w-max rounded-full animate-pulse",
                    session?.user.role === "ADMIN"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800",
                  )}
                >
                  {session?.user.role.toLowerCase()}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {filteredGroupItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      asChild
                      isActive={
                        pathname === item.url ||
                        (item.url !== "/dashboard" &&
                          pathname.startsWith(item.url))
                      }
                      className="text-xs"
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.title === "Inbox" && (
                      <SidebarMenuBadge>24</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
