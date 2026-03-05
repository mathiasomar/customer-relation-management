import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import StatCards from "./stat-cards";
import ViewContacts from "./view-contacts";
import Link from "next/link";

const ContactsPage = () => {
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Contacts</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semiboldnn">Contacts</h1>
        <Button asChild>
          <Link href="/dashboard/contacts/create">Add Contact</Link>
        </Button>
      </div>
      {/* Stat Cards */}
      <StatCards />
      <ViewContacts />
    </div>
  );
};

export default ContactsPage;
