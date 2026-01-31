"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateTenantSubscription } from "@/hooks/use-tenant";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, Mail } from "lucide-react";
import { useState } from "react";
import { Controller, Resolver, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  billingEmail: z
    .string()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
      message: "Invalid email address",
    }),
});

const UpdateBillingEmail = ({ email }: { email: string }) => {
  const [open, setOpen] = useState(false);

  const updateSubscriptionMutation = useUpdateTenantSubscription();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      billingEmail: email || "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    try {
      updateSubscriptionMutation.mutateAsync(
        {
          billingEmail: data.billingEmail,
        },
        {
          onSuccess: () => {
            setOpen(false);
            form.reset();
            toast.success("Updated billing email successfully!");
          },
          onError: (error) => {
            // Error is already handled by react-hot-toast in onError,
            // but we can add additional UI feedback here
            console.error("Billing Email submission error:", error);

            toast.error("Failed to update billing email. Please try again.");
            if (error instanceof Error) {
              toast.error(error.message);
            }
            // Other errors are handled by the default toast in onError
          },
        },
      );
    } catch (error) {
      toast.error(error as string);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Mail className="w-2 h-2" />
          Edit Billing Email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Billing Email</DialogTitle>
          <DialogDescription>Edit your billing email</DialogDescription>
        </DialogHeader>
        {updateSubscriptionMutation.isError && (
          <div className="my-2">
            <Alert variant={"destructive"}>
              <AlertCircleIcon />
              <AlertTitle>
                {updateSubscriptionMutation.error.message}
              </AlertTitle>
            </Alert>
          </div>
        )}
        <form onSubmit={form.handleSubmit(onSubmit)} id="subform">
          <FieldGroup>
            <Controller
              name="billingEmail"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="billingEmail">Billing Email</FieldLabel>
                  <Input
                    {...field}
                    id="billingEmail"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button
            form="subform"
            type="submit"
            disabled={updateSubscriptionMutation.isPending}
          >
            {updateSubscriptionMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Spinner className="w-4 h-4" />
                Updating...
              </span>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateBillingEmail;
