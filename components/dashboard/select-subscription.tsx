"use client";

import { CheckCircle, X } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Spinner } from "../ui/spinner";
import { useState } from "react";
import { Subscription } from "@/generated/prisma/client";
import { useSelectTenantSubscription } from "@/hooks/use-tenant";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SelectSubscription = ({
  subscription,
}: {
  subscription: Subscription;
}) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const updateSubscriptionMutation = useSelectTenantSubscription();

  const handleUpdateSubscription = async () => {
    await updateSubscriptionMutation.mutateAsync(
      {
        subscriptionId: subscription.id,
      },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success("Subscription selected and active!");
          if (subscription.amount > 0) {
            router.push(`/dashboard/subscriptions/${subscription.id}/billing`);
          }
        },
        onError: (error) => {
          // Error is already handled by react-hot-toast in onError,
          // but we can add additional UI feedback here
          console.error("Selection submission error:", error);

          toast.error("Failed to select subscription. Please try again.");
          if (error instanceof Error) {
            toast.error(error.message);
          }
          // Other errors are handled by the default toast in onError
        },
      },
    );
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={subscription.popular ? "default" : "outline"}
          className="w-full self-end"
        >
          Select
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Select {subscription.plan} Plan for KES{" "}
            {subscription.amount.toLocaleString()}?
          </DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
          <div className="flex items-center justify-center gap-4 my-4">
            <Button
              onClick={handleUpdateSubscription}
              disabled={updateSubscriptionMutation.isPending}
              className="bg-green-100 text-green-800 hover:bg-green-800 hover:text-green-100"
            >
              {updateSubscriptionMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" /> Selecting...
                </span>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" /> Select
                </>
              )}
            </Button>
            <Button
              variant={"secondary"}
              onClick={() => setOpen(false)}
              //   disabled={deleteMemberMutation.isPending}
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

export default SelectSubscription;
