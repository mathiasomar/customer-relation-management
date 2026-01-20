"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import SigninSocial from "./signin-social";

const formSchema = z.object({
  email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: "Invalid email address!",
  }),
  password: z.string().min(1, { message: "Password is required!" }),
});

const SigninForm = () => {
  const [loading, setLoading] = useState<boolean>();
  const [isMounted, setIsMounted] = useState(false);

  const lastMethod = authClient.getLastUsedLoginMethod();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    await authClient.signIn.email(
      {
        email: formData.email,
        password: formData.password,
        callbackURL: "/",
        // fetchOptions: {
        //   headers: {
        //     "x-captcha-response": process.env.GOOGLE_SECRET_KEY!,
        //   },
        // },
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          toast.success("Account verified successfully! Redirecting...");
          setLoading(true);
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
        <SigninSocial provider="google" />
        <SigninSocial provider="github" />
      </div>
      <Separator className="my-4" />
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
      </FieldGroup>
      <Button disabled={loading} type="submit" className="mt-6 w-full">
        {loading ? "Signing in..." : "Sign In"}
        {isMounted && lastMethod === "email" && (
          <Badge variant={"secondary"} className="ml-2">
            Last used
          </Badge>
        )}
      </Button>
      <div className="mt-4 flex items-center justify-end">
        <p className="text-sm">
          Don&apos;t have an Account?{" "}
          <Link href="/sign-up" className="underline">
            Sign Up
          </Link>
        </p>
      </div>
    </form>
  );
};

export default SigninForm;
