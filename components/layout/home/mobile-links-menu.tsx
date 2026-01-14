"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { homeLinks } from "@/shared/menu-links";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MobileLinksMenu = () => {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  return (
    <>
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <Menu className="w-4 h-4" />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader className="sr-only">
              <SheetTitle>Links</SheetTitle>
              <SheetDescription>Displays the mobile links.</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col justify-center px-4 h-full w-full gap-4">
              {homeLinks.map((link) => (
                <Link
                  className={cn(
                    "flex items-center gap-4 p-2 text-xs sm:text-sm bg-gray-200 rounded-lg",
                    pathname === link.href ||
                      (link.href !== "/" && pathname.startsWith(link.href))
                      ? "bg-blue-500 text-white"
                      : ""
                  )}
                  href={link.href}
                  key={link.title}
                >
                  <link.icon className="w-4 h-4" />
                  <span className="capitalize">{link.title}</span>
                </Link>
              ))}
              <div className="flex items-center justify-center gap-4">
                <Button asChild size={"sm"}>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button variant={"outline"} asChild size={"sm"}>
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default MobileLinksMenu;
