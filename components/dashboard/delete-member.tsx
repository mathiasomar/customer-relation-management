"use client";

import { Member } from "@/types/member";
import { Button } from "../ui/button";
import { Trash2, X } from "lucide-react";
import { useRemoveMember } from "@/hooks/use-tenant";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Spinner } from "../ui/spinner";

const DeleteMember = ({ member }: { member: Member }) => {
  const [open, setOpen] = useState(false);
  const deleteMemberMutation = useRemoveMember();

  const handleDeleteMember = async () => {
    await deleteMemberMutation.mutateAsync(member.id, {
      onSuccess: () => {
        setOpen(false);
        toast.error("Member deleted!");
      },
      onError: (error) => {
        // Error is already handled by react-hot-toast in onError,
        // but we can add additional UI feedback here
        console.error("Deletion submission error:", error);

        toast.error("Failed to delete member role. Please try again.");
        if (error instanceof Error) {
          toast.error(error.message);
        }
        // Other errors are handled by the default toast in onError
      },
    });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {}
        <Button
          variant={"outline"}
          size={"icon-sm"}
          disabled={member.role === "ADMIN"}
        >
          <Trash2 className="w-2 h-2 text-red-400" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            member.
          </DialogDescription>
          <div className="flex items-center justify-center gap-4 my-4">
            <Button
              onClick={handleDeleteMember}
              variant={"destructive"}
              disabled={deleteMemberMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteMemberMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" /> Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </Button>
            <Button
              variant={"secondary"}
              onClick={() => setOpen(false)}
              disabled={deleteMemberMutation.isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMember;
