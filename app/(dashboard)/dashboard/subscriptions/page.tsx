import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import AddSubscription from "@/components/dashboard/add-subscription";
import ViewSubscription from "@/components/dashboard/view-subscription";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const SubscriptionPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <div className="w-full">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Subscriptions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semiboldnn">Subscriptions</h1>
        {(session?.user.role === "ADMIN" && <AddSubscription />) || null}
      </div>
      <ViewSubscription />
    </div>
  );
};

export default SubscriptionPage;
