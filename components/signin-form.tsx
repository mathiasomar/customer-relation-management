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

const formSchema = z.object({
  email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: "Invalid email address!",
  }),
  password: z.string().min(1, { message: "Password is required!" }),
});

const SigninForm = () => {
  const [loading, setLoading] = useState<boolean>();
  const [socialLoading, setSocialLoading] = useState<boolean>();
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
          toast.success("Account logged in successfully!");
          setLoading(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setLoading(false);
        },
      }
    );
  };

  const handleSignUpWithSocial = async (social: string) => {
    await authClient.signIn.social(
      {
        provider: social,
        callbackURL: "/",
      },
      {
        onRequest: () => {
          setLoading(true);
          setSocialLoading(true);
        },
        onSuccess: () => {
          toast.success("Account logged in successfully! Redirecting...");
          form.reset();
          setLoading(false);
          setSocialLoading(false);
        },
        onError: (ctx) => {
          toast(ctx.error.message);
          setLoading(false);
          setSocialLoading(false);
        },
      }
    );
  };
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Button
        variant={"outline"}
        type="button"
        className="w-full"
        onClick={() => handleSignUpWithSocial("google")}
        disabled={socialLoading}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-4"
          viewBox="0 0 256 262"
        >
          <path
            fill="#4285f4"
            d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
          ></path>
          <path
            fill="#34a853"
            d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
          ></path>
          <path
            fill="#fbbc05"
            d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
          ></path>
          <path
            fill="#eb4335"
            d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
          ></path>
        </svg>
        <span>Continue with Google</span>
        {isMounted && lastMethod === "google" && (
          <Badge className="ml-2">Last used</Badge>
        )}
      </Button>
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
