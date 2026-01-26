"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import SigninSocial from "./signin-social";

const formSchema = z
  .object({
    name: z
      .string()
      .min(2, "Full name must be at least 2 characters!")
      .max(50, "Full name must be atmost 50 characters"),
    email: z
      .string()
      .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: "Invalid email address!",
      }),
    password: z.string().min(1, { message: "Password is required!" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm Password is required!" }),
  })
  .refine(
    (data) => {
      const passwordMatch = data.password === data.confirmPassword;
      return passwordMatch;
    },
    {
      message: "Password do not match",
      path: ["confirmPassword"],
    },
  );

const SignupForm = () => {
  const [loading, setLoading] = useState<boolean>();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    await authClient.signUp.email(
      {
        email: formData.email,
        password: formData.password,
        name: formData.name,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onResponse: () => {},
        onSuccess: () => {
          toast.success("Account created successfully✅!");
          form.reset();
          setLoading(true);
          router.push("/sign-in");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setLoading(false);
        },
      },
    );
  };
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <SigninSocial signUp provider="google" />
        <SigninSocial signUp provider="github" />
      </div>
      <Separator className="my-4" />
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                {...field}
                id="name"
                aria-invalid={fieldState.invalid}
                placeholder="Enter Full Name"
                autoComplete="off"
                disabled={loading}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
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
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                {...field}
                id="password"
                type="password"
                aria-invalid={fieldState.invalid}
                placeholder="********"
                autoComplete="off"
                disabled={loading}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirmPassword">ConfirmPassword</FieldLabel>
              <Input
                {...field}
                id="confirmPassword"
                type="password"
                aria-invalid={fieldState.invalid}
                placeholder="********"
                autoComplete="off"
                disabled={loading}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button disabled={loading} type="submit" className="mt-6 w-full">
        {loading ? "Signing up..." : "Sign Up"}
      </Button>
      <div className="mt-4 flex flex-col items-end justify-center">
        <p className="text-sm">
          Already have an Account?{" "}
          <Link href="/sign-in" className="underline">
            Sign In
          </Link>
        </p>
        {/* <p className="text-sm">
          Have you been invited and don&apos;t have a password?{" "}
          <Link href="/add-password" className="underline">
            Add Password
          </Link>
        </p> */}
      </div>
    </form>
  );
};

export default SignupForm;
