"use client";

import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect } from "next/navigation";
import { SidebarTrigger } from "../ui/sidebar";
import { ModeToggle } from "../mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "../ui/spinner";

const Navbar = () => {
  const handleLogout = async () => {
    await authClient.signOut();
    redirect("/");
  };

  const { data: session, isPending } = authClient.useSession();

  //   const { data: session } = authClient.useSession();
  //   if (!session) return null;
  return (
    <nav className="p-4 flex items-center justify-between sticky bg-background top-0 z-10">
      {/* LEFT */}
      <SidebarTrigger />
      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <Link href={"/"} className="text-xs lg:text-sm 2xl:text-base">
          Dashboard
        </Link>
        {/* THEME TOGGLE */}
        <ModeToggle />
        {/* USER MENU */}
        {isPending ? (
          <Spinner />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback>
                  {session?.user?.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10}>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/profile/123`}
                  className="text-xs md:text-sm xl:text-base 3xl:text-lg"
                >
                  <User className="h-[1.1rem] w-[1.1rem] mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/settings"
                  className="text-xs md:text-sm xl:text-base 3xl:text-lg"
                >
                  <Settings className="h-[1.1rem] w-[1.1rem] mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={handleLogout}
                className="text-xs md:text-sm xl:text-base 3xl:text-lg"
              >
                <LogOut className="h-[1.1rem] w-[1.1rem] mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
