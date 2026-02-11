import { cva, type VariantProps } from "class-variance-authority";
import { Children, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const AvatarGroupVariants = cva("flex items-center", {
  variants: {
    spacing: {
      tight: "-space-x-2",
      default: "-space-x-1",
      loose: "-space-x-0.5",
      none: "space-x-0",
    },
  },
  defaultVariants: {
    spacing: "default",
  },
});

export type AvatarGroupProps = {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  size?: number;
} & VariantProps<typeof AvatarGroupVariants>;

export type AvatarMoreProps = {
  count: number;
  className?: string;
  size?: number;
};

export const AvatarMore = ({
  count,
  className,
  size = 40,
  ...props
}: AvatarMoreProps) => (
  <div
    data-slot="avatar"
    className={cn(
      "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium text-muted-foreground",
      className,
    )}
    style={{
      width: size,
      height: size,
    }}
    {...props}
  >
    +{count}
  </div>
);

export const AvatarGroup = ({
  children,
  className,
  animate = false,
  spacing,
  ...props
}: AvatarGroupProps) => (
  <div
    className={cn(
      "h-14",
      AvatarGroupVariants({ spacing }),
      animate && "hover:space-x-0 *:transition-all",
      className,
    )}
    {...props}
  >
    {Children.map(children, (child) => {
      if (!child) {
        return null;
      }

      return child;
    })}
  </div>
);
