"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { homeLinks } from "@/shared/menu-links";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HomeLinks = () => {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  return (
    <div className={cn("flex items-center gap-6", isMobile && "hidden")}>
      {homeLinks.map((link) => (
        <Link
          href={link.href}
          key={link.title}
          className={cn(
            "flex items-center gap-2",
            pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href))
              ? "text-blue-500 font-bold"
              : ""
          )}
        >
          {/* <link.icon className="h-3 w-3 lg:w-4 lg:h-4" /> */}
          <span className="capitalize md:text-[11px] lg:text-xs xl:text-base hover:text-blue-500 transition-colors duration-300">
            {link.title}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default HomeLinks;
