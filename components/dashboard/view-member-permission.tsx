import { Member } from "@/types/member";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const ViewMemberPermission = ({ member }: { member: Member }) => {
  const perm = member.permissions as Record<string, boolean> | null;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} size={"icon-sm"}>
          <Shield className="w-2 h-2 text-green-400" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Member Permissions for: {member.user.name}</DialogTitle>
          <DialogDescription>
            This permissions state what the can and cannot do
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {perm && (
            <>
              <div className="flex items-center gap-4 text-xs border p-4 rounded-md">
                <h4 className="font-semibold">Can Manage Users</h4>
                <span
                  className={cn(
                    "w-max py-1 px-3 rounded-xl",
                    perm.canManageUsers
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800",
                  )}
                >
                  {perm.canManageUsers ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs border p-4 rounded-md font-semibold">
                <h4 className="font-semibold">Can Manage Settings</h4>
                <span
                  className={cn(
                    "w-max py-1 px-3 rounded-xl",
                    perm.canManageSettings
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800",
                  )}
                >
                  {perm.canManageSettings ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs border p-4 rounded-md font-semibold">
                <h4 className="font-semibold">Can Manage Billing</h4>
                <span
                  className={cn(
                    "w-max py-1 px-3 rounded-xl",
                    perm.canManageBilling
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800",
                  )}
                >
                  {perm.canManageBilling ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs border p-4 rounded-md font-semibold">
                <h4 className="font-semibold">Can Manage Integrations</h4>
                <span
                  className={cn(
                    "w-max py-1 px-3 rounded-xl",
                    perm.canManageIntegrations
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800",
                  )}
                >
                  {perm.canManageIntegrations ? "Yes" : "No"}
                </span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewMemberPermission;
