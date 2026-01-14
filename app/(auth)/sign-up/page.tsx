import SignupForm from "@/components/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SignUpPage = () => {
  return (
    <div className="w-full min-h-screen py-6 bg-secondary flex items-center justify-center">
      <div className="w-full max-w-sm p-4 md:max-w-md md:p-2 lg:max-w-lg lg:p-0">
        <Card>
          <CardContent>
            <CardHeader>
              <CardTitle className="text-center font-bold text-2xl">
                Join O-CRM
              </CardTitle>
              <CardDescription className="text-center">
                Get started today. Your sales will thank you.
              </CardDescription>
            </CardHeader>
            <div className="mt-5">
              <SignupForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUpPage;
