import Search from "@/components/dashboard/search";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import ViewDataTable from "./view-data-table";
import Link from "next/link";
import { Plus } from "lucide-react";

const OrganizationPage = () => {
  return (
    <div className="w-full">
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
      <div className="flex items-center justify-between mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semiboldnn">Organizations</h1>
        <Button asChild>
          <Link
            href="/dashboard/organizations/new"
            className="flex items-center"
          >
            <Plus className="mr-2" />
            New Organization
          </Link>
        </Button>
      </div>
      <div className="my-4">
        <Search />
      </div>
      <ViewDataTable />
    </div>
  );
};

export default OrganizationPage;
