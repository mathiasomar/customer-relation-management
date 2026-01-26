import AddPasswordForm from "@/components/add-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AddPasswordPage = () => {
  return (
    <div className="w-full min-h-screen py-6 bg-secondary flex items-center justify-center">
      <div className="w-full max-w-sm p-4 md:max-w-md md:p-2 lg:max-w-lg lg:p-0">
        <Card>
          <CardContent>
            <CardHeader>
              <CardTitle className="text-center font-bold text-2xl">
                Add Password
              </CardTitle>
              <CardDescription className="text-center">
                Create your password to login
              </CardDescription>
            </CardHeader>
            <div className="mt-5">
              <AddPasswordForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddPasswordPage;
