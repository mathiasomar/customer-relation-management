"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import * as z from "zod";
import { useCreateTenant } from "@/hooks/use-tenant";
import { Controller, Resolver, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

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

const AddTenantStarter = () => {
  const router = useRouter();
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
          toast.success("Organization added successfully!");
          router.push("/dashboard");
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
    <Card>
      <CardHeader>
        <h1 className="text-lg font-bold">Welcome to O-CRM</h1>
        <p className="text-sm text-muted-foreground">
          To get started, please add a Organization to your account.
        </p>
      </CardHeader>
      <CardContent>
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
                    disabled={addTenantMutation.isPending}
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
                    disabled={addTenantMutation.isPending}
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
                    disabled={addTenantMutation.isPending}
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
                    disabled={addTenantMutation.isPending}
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
            {addTenantMutation.isPending ? "Submitting..." : "Add Organization"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddTenantStarter;
