"use client";

import { DataGridSkeleton } from "@/components/dashboard/loaders/data-grid-skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useContact } from "@/hooks/use-contact";
import { useParams } from "next/navigation";
import { ContactHeader } from "./_components/contact-header";
import { Contact } from "@/generated/prisma/client";
import { ContactInfo } from "./_components/contact-info";
import { ContactTabs } from "./_components/contact-tabs";
import { ContactSidebar } from "./_components/contact-sidebar";

const ContactPage = () => {
  const params = useParams();
  const { id } = params;
  const { data: contact, isFetching } = useContact(id as string);
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/contacts">Contacts</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {isFetching ? "Loading..." : contact?.email}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {isFetching ? (
        <DataGridSkeleton items={4} columns={2} />
      ) : (
        <>
          {/* Header with back button, name, and actions */}
          <ContactHeader contact={contact as Contact} />

          <Separator className="my-6" />
          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Contact Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information Cards */}
              <ContactInfo contact={contact} />

              {/* Tabs for Activities, Notes, Emails, Tasks */}
              <ContactTabs
                contactId={contact?.id as string}
                initialActivities={contact?.activities}
                initialNotes={contact?.notesList}
                initialTasks={contact?.tasks}
              />
            </div>
            {/* Right Column - Related Items & Stats */}
            <div className="lg:col-span-1 space-y-6">
              <ContactSidebar
                contact={contact}
                leads={contact?.leads}
                opportunities={contact?.opportunities}
                deals={contact?.deals}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContactPage;
