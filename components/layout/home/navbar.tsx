import Wrapper from "@/components/wrapper";
import { ChartNoAxesCombined } from "lucide-react";
import Link from "next/link";
import React from "react";
import HomeLinks from "./home-links";
import { Button } from "@/components/ui/button";
// import ProfileMenu from "./profile-menu";
import { ModeToggle } from "@/components/mode-toggle";
import MobileLinksMenu from "./mobile-links-menu";
import { headers } from "next/headers";
import ProfileMenu from "./profile-menu";
import { auth } from "@/lib/auth";

const Navbar = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <div className="w-full bg-secondary sticky top-0">
      <Wrapper className="h-[10vh] flex items-center justify-between">
        <Link href="/" aria-label="go home" className="flex items-center gap-2">
          <ChartNoAxesCombined className="w-4 h-4 text-blue-500 md:w-8 md:h-8" />
          <span className="text-sm md:text-xl font-bold">O-CRM</span>
        </Link>
        <HomeLinks />
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Button asChild className="hidden md:text-xs md:flex" size={"sm"}>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <ProfileMenu />
            </>
          ) : (
            <>
              <Button asChild className="hidden md:text-xs lg:flex" size={"sm"}>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                variant={"outline"}
                asChild
                className="hidden md:text-xs lg:flex"
                size={"sm"}
              >
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
          <ModeToggle />
          <MobileLinksMenu />
        </div>
      </Wrapper>
    </div>
  );
};

export default Navbar;
