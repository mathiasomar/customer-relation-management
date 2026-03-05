"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2, Sparkles, Globe } from "lucide-react";

interface CustomLoaderProps {
  variant?: "spinner" | "pulse" | "dots" | "wave";
  text?: string;
}

export function CustomLoader({
  variant = "spinner",
  text = "Loading",
}: CustomLoaderProps) {
  const renderLoader = () => {
    switch (variant) {
      case "spinner":
        return (
          <div className="relative">
            {/* Gradient spinner */}
            <div className="w-16 h-16 rounded-full bg-linear-to-r from-primary via-primary/50 to-transparent animate-spin">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-background rounded-full" />
            </div>
            {/* Inner icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
        );

      case "pulse":
        return (
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-4 h-16 bg-primary rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  height: `${16 + i * 8}px`,
                }}
              />
            ))}
          </div>
        );

      case "dots":
        return (
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-4 h-4 bg-primary rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        );

      case "wave":
        return (
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div
              className="absolute inset-2 bg-primary/40 rounded-full animate-ping"
              style={{ animationDelay: "0.3s" }}
            />
            <div
              className="absolute inset-4 bg-primary/60 rounded-full animate-ping"
              style={{ animationDelay: "0.6s" }}
            />
            <div className="absolute inset-6 bg-primary rounded-full animate-pulse" />
            <Globe className="absolute inset-0 m-auto h-8 w-8 text-white" />
          </div>
        );

      default:
        return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {renderLoader()}
      {text && (
        <div className="flex items-center gap-1 text-primary font-medium">
          <span>{text}</span>
          <span className="animate-bounce delay-0">.</span>
          <span className="animate-bounce delay-150">.</span>
          <span className="animate-bounce delay-300">.</span>
        </div>
      )}
    </div>
  );
}

export function RouteLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleStart = () => {
      clearTimeout(timeoutId);
      setIsLoading(true);
    };

    const handleComplete = () => {
      timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    // Intercept navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      handleStart();
      originalPushState.apply(this, args);
    };

    window.history.replaceState = function (...args) {
      handleStart();
      originalReplaceState.apply(this, args);
    };

    const handlePopState = () => {
      handleStart();
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("load", handleComplete);

    return () => {
      clearTimeout(timeoutId);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("load", handleComplete);
    };
  }, []);

  // Reset loading state when route changes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 flex items-start justify-center">
      {/* Backdrop - only affects main content area */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 250px, black 250px, black calc(100% - 250px), transparent calc(100% - 250px))",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 250px, black 250px, black calc(100% - 250px), transparent calc(100% - 250px))",
        }}
      />

      {/* Loader positioned in the center of main content */}
      <div className="relative z-10 mt-32">
        <CustomLoader variant="spinner" text="Loading" />
      </div>
    </div>
  );
}
