import { cn } from "@/lib/utils";
import React from "react";

const Wrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "mx-auto max-w-5xl lg:max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-0 py-6",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Wrapper;
