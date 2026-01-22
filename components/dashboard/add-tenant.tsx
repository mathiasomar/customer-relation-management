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
import { AlertCircleIcon, Plus } from "lucide-react";
import { Alert, AlertTitle } from "../ui/alert";
import { useState } from "react";
import { useCreateTenant } from "@/hooks/use-tenant";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .max(50, { message: "Slug must be at most 50 characters" })
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  website: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
  timezone: z.string().default("UTC"),
  currency: z.string().default("USD"),
  language: z.string().default("en"),
});

const AddTenant = ({ type }: { type: "switcher" | "button" | "empty" }) => {
  const [open, setOpen] = useState(false);
  const addTenantMutation = useCreateTenant();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      name: "",
      slug: "",
      website: "",
      industry: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    try {
      addTenantMutation.mutateAsync(data, {
        onSuccess: () => {
          setOpen(false);
          form.reset();
          toast.success("Organization added successfully!");
        },
        onError: (error) => {
          // Error is already handled by react-hot-toast in onError,
          // but we can add additional UI feedback here
          console.error("Organization submission error:", error);

          toast.error("Failed to add organization. Please try again.");
          if (error instanceof Error) {
            toast.error(error.message);
          }
          // Other errors are handled by the default toast in onError
        },
      });
    } catch (error) {
      toast.error(error as string);
    }
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={type === "switcher" ? "outline" : "default"}>
          {type === "switcher" && (
            <>
              <Plus className="h-2 w-2" /> Create New Organization
            </>
          )}
          {type === "button" && (
            <>
              <Plus className="h-2 w-2" /> New Organization
            </>
          )}
          {type === "empty" && <>Create Organization</>}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-[85vh] md:h-screen">
          {addTenantMutation.isError && (
            <div className="my-2">
              <Alert variant={"destructive"}>
                <AlertCircleIcon />
                <AlertTitle>{addTenantMutation.error.message}</AlertTitle>
              </Alert>
            </div>
          )}
          <SheetHeader>
            <SheetTitle className="mb-4">Add Organization</SheetTitle>
            <SheetDescription>Add a new organization</SheetDescription>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="name">Name</FieldLabel>
                      <Input
                        {...field}
                        id="name"
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
                  name="slug"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="slug">Slug</FieldLabel>
                      <Input
                        {...field}
                        id="slug"
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
                  name="website"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="website">Website</FieldLabel>
                      <Input
                        {...field}
                        id="website"
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
                  name="industry"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="industry">Industry</FieldLabel>
                      <Input
                        {...field}
                        id="industry"
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

              <Button
                disabled={addTenantMutation.isPending}
                type="submit"
                className="mt-6 w-full"
              >
                {addTenantMutation.isPending
                  ? "Submitting..."
                  : "Add Organization"}
              </Button>
            </form>
          </SheetHeader>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default AddTenant;
