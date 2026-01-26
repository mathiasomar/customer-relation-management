"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: "Invalid email address!",
  }),
});

const AddPasswordForm = () => {
  const [loading, setLoading] = useState<boolean>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    // Do something with the form values;
    const { error } = await authClient.requestPasswordReset(
      {
        email: formData.email,
        redirectTo: "/dashboard/add-password/reset-password",
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          toast.success("Password reset link sent to your email✅!");
          form.reset();
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setLoading(false);
        },
      },
    );

    if (error) {
      toast.error(error.message);
      return;
    }
  };
  return (
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
                placeholder="Enter Email"
                autoComplete="off"
                disabled={loading}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              <FieldDescription>Only admin can see your email</FieldDescription>
            </Field>
          )}
        />
      </FieldGroup>
      <Button disabled={loading} type="submit" className="mt-6 w-full">
        {loading ? "Adding..." : "Add"}
      </Button>
      <div className="mt-4 flex flex-col items-end justify-center">
        <p className="text-sm">
          Already have an Account?{" "}
          <Link href="/sign-in" className="underline">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
};

export default AddPasswordForm;
