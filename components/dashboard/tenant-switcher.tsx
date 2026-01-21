"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTenant, useTenants, useSwitchTenant } from "@/hooks/use-tenant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ChevronsUpDown, View } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import AddTenant from "./add-tenant";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
// import { cn } from "@/lib/utils";

const TenantSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const { data: sesssion } = authClient.useSession();

  const { data: dataTenants, isFetching: tenantsLoading } = useTenants();
  const { data: dataTenant, isFetching: tenantLoading } = useTenant();
  const { mutate: switchTenant, isPending: switchingTenant } =
    useSwitchTenant();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" className="w-full justify-between" disabled>
          <span className="truncate">Loading...</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    );
  }

  const currentTenant = {
    name: tenantLoading
      ? "Loading..."
      : dataTenant?.error
        ? "No Access"
        : dataTenant?.tenant?.name || "No tenant",
    slug: tenantLoading
      ? "loading"
      : dataTenant?.error
        ? "No Access"
        : dataTenant?.tenant?.slug || "no-tenant",
  };

  const handleTenantSwitch = async (tenantSlug: string) => {
    // Find the tenant ID from the slug
    const selectedTenant = dataTenants?.find((t) => t.slug === tenantSlug);
    if (selectedTenant) {
      switchTenant(selectedTenant.id, {
        onSuccess: () => {
          // Refresh the session and reload the page
          authClient.getSession();
          router.refresh();
        },
        onError: (error) => {
          console.error("Failed to switch tenant:", error);
        },
      });
    }
  };
  return (
    <div className="flex items-center gap-2 w-max">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="truncate">{currentTenant.name}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* List user's tenants */}
          {tenantsLoading ? (
            <Skeleton className="w-50 h-5" />
          ) : (
            dataTenants?.map((tenant) => (
              <DropdownMenuItem
                key={tenant.id}
                onClick={() => handleTenantSwitch(tenant.slug)}
                disabled={switchingTenant}
                className={tenant.slug === currentTenant.slug ? "bg-muted" : ""}
              >
                {tenant.name}
                {switchingTenant && tenant.slug === currentTenant.slug && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Switching...
                  </span>
                )}
              </DropdownMenuItem>
            ))
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <AddTenant type="switcher" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {sesssion?.session.tenantId && (
        <Button asChild>
          <Link href="/dashboard/organizations/view">
            <View />
          </Link>
        </Button>
      )}
    </div>
  );
};

export default TenantSwitcher;
