"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

interface SigninSocialProps {
  provider: "google" | "github";
  signUp?: boolean;
}

const SigninSocial = ({ provider, signUp }: SigninSocialProps) => {
  const [isPending, setIsPending] = useState<boolean>();

  const [isMounted, setIsMounted] = useState(false);

  const lastMethod = authClient.getLastUsedLoginMethod();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleSignUpWithSocial = async () => {
    await authClient.signIn.social({
      provider,
      callbackURL: "/",
      errorCallbackURL: "/sign-in/error",
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    });
  };

  const action = signUp ? "Up" : "In";
  const providerName = provider === "google" ? "Google" : "Github";
  return (
    <Button
      variant={"outline"}
      type="button"
      className="w-full"
      onClick={handleSignUpWithSocial}
      disabled={isPending}
    >
      {provider === "google" ? (
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
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={800}
          height={800}
          viewBox="0 0 20 20"
        >
          <title>{"github [#142]"}</title>
          <path
            fill="#000"
            fillRule="evenodd"
            d="M10 0c5.523 0 10 4.59 10 10.253 0 4.529-2.862 8.371-6.833 9.728-.507.101-.687-.219-.687-.492 0-.338.012-1.442.012-2.814 0-.956-.32-1.58-.679-1.898 2.227-.254 4.567-1.121 4.567-5.059 0-1.12-.388-2.034-1.03-2.752.104-.259.447-1.302-.098-2.714 0 0-.838-.275-2.747 1.051A9.396 9.396 0 0 0 10 4.958a9.375 9.375 0 0 0-2.503.345C5.586 3.977 4.746 4.252 4.746 4.252c-.543 1.412-.2 2.455-.097 2.714-.639.718-1.03 1.632-1.03 2.752 0 3.928 2.335 4.808 4.556 5.067-.286.256-.545.708-.635 1.371-.57.262-2.018.715-2.91-.852 0 0-.529-.985-1.533-1.057 0 0-.975-.013-.068.623 0 0 .655.315 1.11 1.5 0 0 .587 1.83 3.369 1.21.005.857.014 1.665.014 1.909 0 .271-.184.588-.683.493C2.865 18.627 0 14.783 0 10.253 0 4.59 4.478 0 10 0"
          />
        </svg>
      )}
      <span>
        Sign {action} with {providerName}
      </span>
      {isMounted && lastMethod === provider && (
        <Badge className="ml-2">Last used</Badge>
      )}
    </Button>
  );
};

export default SigninSocial;
