"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { AlertCircleIcon, Edit2 } from "lucide-react";
import { Member } from "@/types/member";
import * as z from "zod";
import { useState } from "react";
import { Controller, Resolver, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateMemberRole } from "@/hooks/use-tenant";
import { TenantMemberRole } from "@/generated/prisma/enums";
import { TenantPermissions } from "@/types/tenant";
import { toast } from "sonner";
import { Alert, AlertTitle } from "../ui/alert";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Spinner } from "../ui/spinner";

const formSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "MEMBER"]),
  canManageUsers: z.boolean().optional(),
  canManageSettings: z.boolean().optional(),
  canManageBilling: z.boolean().optional(),
  canManageIntegrations: z.boolean().optional(),
});

const EditMemberRole = ({ member }: { member: Member }) => {
  const [open, setOpen] = useState(false);

  const updateMemberRoleMutation = useUpdateMemberRole();

  const perm = member.permissions as Record<string, boolean> | null;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      role: member.role,
      canManageUsers: perm?.canManageUsers ?? false,
      canManageSettings: perm?.canManageSettings ?? false,
      canManageBilling: perm?.canManageBilling ?? false,
      canManageIntegrations: perm?.canManageIntegrations ?? false,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    const permissions = {
      canManageUsers: data.canManageUsers,
      canManageSettings: data.canManageSettings,
      canManageBilling: data.canManageBilling,
      canManageIntegrations: data.canManageIntegrations,
    };
    try {
      updateMemberRoleMutation.mutateAsync(
        {
          memberId: member.id,
          role: data.role as TenantMemberRole,
          permissions: permissions as TenantPermissions,
        },
        {
          onSuccess: () => {
            setOpen(false);
            form.reset();
            toast.success("Updated role successfully!");
          },
          onError: (error) => {
            // Error is already handled by react-hot-toast in onError,
            // but we can add additional UI feedback here
            console.error("Role submission error:", error);

            toast.error("Failed to update member role. Please try again.");
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
        <Button variant={"outline"} size={"icon-sm"}>
          <Edit2 className="w-2 h-2 text-blue-400" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>Edit the role of the member</DialogDescription>
        </DialogHeader>
        {updateMemberRoleMutation.isError && (
          <div className="my-2">
            <Alert variant={"destructive"}>
              <AlertCircleIcon />
              <AlertTitle>{updateMemberRoleMutation.error.message}</AlertTitle>
            </Alert>
          </div>
        )}
        <form onSubmit={form.handleSubmit(onSubmit)} id="subform">
          <FieldGroup>
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
        </form>
        <DialogFooter>
          <Button
            form="subform"
            type="submit"
            disabled={updateMemberRoleMutation.isPending}
          >
            {updateMemberRoleMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Spinner className="w-4 h-4" />
                Updating
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

export default EditMemberRole;
