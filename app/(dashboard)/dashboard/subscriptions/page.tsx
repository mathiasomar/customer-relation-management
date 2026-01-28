import Search from "@/components/dashboard/search";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ViewDataTable from "./view-data-table";
import AddTenant from "@/components/dashboard/add-tenant";

const SubscriptionPage = () => {
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
        <AddTenant type="button" />
      </div>
      <div className="my-4">
        <Search />
      </div>
      <ViewDataTable />
    </div>
  );
};

export default SubscriptionPage;
