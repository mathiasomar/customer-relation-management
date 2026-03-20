"use client";

import EditContactForm from "@/components/dashboard/edit-contact-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Spinner } from "@/components/ui/spinner";
import { Contact, Tag, UserRole } from "@/generated/prisma/browser";
import { useContact } from "@/hooks/use-contact";
import { useTags } from "@/hooks/use-tag";
import { useTenantMembers } from "@/hooks/use-tenant";
import { useParams } from "next/navigation";

interface TeamMembersTypes {
  id: string;
  email: string;
  createdAt: Date;
  name: string;
  image: string | null;
  role: UserRole;
}

const EditContactPage = () => {
  const params = useParams();
  const { id } = params;
  const { data: contact, isFetching } = useContact(id as string);
  const { data: members, isFetching: loadingMembers } = useTenantMembers();
  const { data: tags, isFetching: loadingTags } = useTags();

  const teamMembers = members?.map((member) => member.user);
  const contactTags = contact?.tags.map((t) => t.tag.id);

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dashboard`}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dashboard/contacts`}>
              Contacts
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dashboard/contacts/${id}`}>
              {isFetching
                ? "Loading..."
                : `${contact?.firstName} ${contact?.lastName}`}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Edit Contact</h1>
          <p className="text-muted-foreground text-sm">
            Update the information for{" "}
            {isFetching ? "Loading..." : contact?.firstName}{" "}
            {isFetching ? "" : contact?.lastName}. Make sure to save your
            changes when you&apos;re done.
          </p>
        </div>
      </div>

      {/* Edit contact form */}
      {isFetching || loadingMembers || loadingTags ? (
        <div className="w-full h-[60vh] flex flex-col justify-center items-center gap-4">
          <Spinner className="w-20 h-20" />
          <p className="text-muted-foreground animate-pulse duration-300">
            Loading edit contact form...
          </p>
        </div>
      ) : (
        <EditContactForm
          contact={contact as Contact}
          teamMembers={teamMembers as TeamMembersTypes[]}
          availableTags={tags as Tag[]}
          initialTags={contactTags}
        />
      )}
    </div>
  );
};

export default EditContactPage;
