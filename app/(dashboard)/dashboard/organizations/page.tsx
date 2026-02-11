import Search from "@/components/dashboard/search";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
// import ViewDataTable from "./view-data-table";
import AddTenant from "@/components/dashboard/add-tenant";
import CardsStat from "./cards-stat";
import ViewOrganizations from "./view-organizations";

const OrganizationPage = () => {
  return (
    <div className="w-full space-y-4">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Organizations</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semiboldnn">Organizations</h1>
        <AddTenant type="button" />
      </div>
      {/* Stat Cards */}
      <CardsStat />
      <div>
        <Search />
      </div>
      {/* <ViewDataTable /> */}
      {/* Organization cards */}
      <ViewOrganizations />
    </div>
  );
};

export default OrganizationPage;
