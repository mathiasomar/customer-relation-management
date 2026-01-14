import AppSidebar from "@/components/dashboard/app-sidebar";
import Navbar from "@/components/dashboard/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/");

  return (
    <div className="w-full h-screen overflow-auto">
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <main className="w-full">
          <Navbar />
          <div className="p-4 w-full">{children}</div>
          {/* <Toaster position="top-right" reverseOrder={false} /> */}
        </main>
      </SidebarProvider>
    </div>
  );
};

export default layout;
