import AddUser from "@/components/dashboard/add-user";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Search from "@/components/dashboard/search";
import ViewDataTable from "./view-data-table";

const UserPage = async () => {
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session) redirect("/");

  //   const { users } = await auth.api.listUsers({
  //     headers: headerList,
  //     query: {
  //       searchValue: search,
  //       searchField: "name",
  //       searchOperator: "contains",
  //       limit: 100,
  //       sortBy: "createdAt",
  //       sortDirection: "desc",
  //     },
  //   });

  //   const sortedUsers = users.sort((a, b) => {
  //     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  //   });

  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="w-full">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semiboldnn">All Users</h1>
        <AddUser />
      </div>
      <div className="my-4">
        <Search />
      </div>
      <ViewDataTable />
    </div>
  );
};

export default UserPage;
