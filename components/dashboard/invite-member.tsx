"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Resolver } from "react-hook-form";
import * as z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { AlertCircleIcon, UserRoundPlus } from "lucide-react";
import { Alert, AlertTitle } from "../ui/alert";
import { useState } from "react";
import { useInviteMember } from "@/hooks/use-tenant";
import { toast } from "sonner";
import { UserRole } from "@/generated/prisma/enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";

const formSchema = z.object({
  email: z
    .string()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
      message: "Invalid email address!",
    })
    .min(1, { message: "Email is required!" }),
  role: z.enum(["ADMIN", "MANAGER", "AGENT", "VIEWER", "MEMBER"]).optional(),
  canManageUsers: z.boolean().optional(),
  canManageSettings: z.boolean().optional(),
  canManageBilling: z.boolean().optional(),
  canManageIntegrations: z.boolean().optional(),
});

const InviteMember = () => {
  const [open, setOpen] = useState(false);
  const inviteMemberMutation = useInviteMember();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      email: "",
      role: "MEMBER",
      canManageUsers: false,
      canManageSettings: false,
      canManageBilling: false,
      canManageIntegrations: false,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    try {
      inviteMemberMutation.mutateAsync(
        { email: data.email, role: data.role as UserRole },
        {
          onSuccess: () => {
            setOpen(false);
            form.reset();
            toast.success("User invited successfully!");
          },
          onError: (error) => {
            // Error is already handled by react-hot-toast in onError,
            // but we can add additional UI feedback here
            console.error("Invitation submission error:", error);

            toast.error("Failed to invite user. Please try again.");
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size={"sm"} variant={"outline"}>
          <UserRoundPlus className="w-4 h-4" />
          Invite Member
        </Button>
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-[85vh] md:h-screen">
          {inviteMemberMutation.isError && (
            <div className="my-2">
              <Alert variant={"destructive"}>
                <AlertCircleIcon />
                <AlertTitle>{inviteMemberMutation.error.message}</AlertTitle>
              </Alert>
            </div>
          )}
          <SheetHeader>
            <SheetTitle className="mb-4">Invite Member</SheetTitle>
            <SheetDescription>
              Add a new member to your organization
            </SheetDescription>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        {...field}
                        id="email"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="role"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="role">Role</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                          <SelectItem value="AGENT">Agent</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <div className="flex items-center gap-4 flex-wrap">
                  <Controller
                    name="canManageUsers"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <span className="flex items-center gap-2">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="canManageUsers"
                          />
                          <label
                            className="text-xs max-w-200"
                            htmlFor="canManageUsers"
                          >
                            Can Manage Users
                          </label>
                        </span>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="canManageSettings"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <span className="flex items-center gap-2">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="canManageSettings"
                          />
                          <label
                            className="text-xs max-w-200"
                            htmlFor="canManageSettings"
                          >
                            Can Manage Settings
                          </label>
                        </span>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="canManageBilling"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <span className="flex items-center gap-2">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="canManageBilling"
                          />
                          <label
                            className="text-xs max-w-200"
                            htmlFor="canManageBilling"
                          >
                            Can Manage Billing
                          </label>
                        </span>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="canManageIntegrations"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <span className="flex items-center gap-2">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="canManageIntegrations"
                          />
                          <label
                            className="text-xs max-w-200"
                            htmlFor="canManageIntegrations"
                          >
                            Can Manage Integrations
                          </label>
                        </span>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </FieldGroup>

              <Button
                disabled={inviteMemberMutation.isPending}
                type="submit"
                className="mt-6 w-full"
              >
                {inviteMemberMutation.isPending
                  ? "Submitting..."
                  : "Invite Member"}
              </Button>
            </form>
          </SheetHeader>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default InviteMember;
