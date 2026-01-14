"use client";

import SigninForm from "@/components/signin-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SignInPage = () => {
  return (
    <div className="w-full min-h-screen py-6 bg-secondary flex items-center justify-center">
      <div className="w-full max-w-sm p-4 md:max-w-md md:p-2 lg:max-w-lg lg:p-0">
        <Card>
          <CardContent>
            <CardHeader>
              <CardTitle className="text-center font-bold text-2xl">
                Welcome Back to O-CRM
              </CardTitle>
              <CardDescription className="text-center">
                Sign in and manage your customer data.
              </CardDescription>
            </CardHeader>
            <div className="mt-5">
              <SigninForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignInPage;
