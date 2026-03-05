"use client";

import AddTag from "@/components/dashboard/add-tag";
import { CreateContactForm } from "@/components/dashboard/create-contact-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Spinner } from "@/components/ui/spinner";
import { useTags } from "@/hooks/use-tag";
import { useTenantMembers } from "@/hooks/use-tenant";
import { CreateContactFormProps } from "@/types/contact";

const CreateContactPage = () => {
  const { data: members, isFetching: loadingMembers } = useTenantMembers();
  const { data: tags, isFetching: loadingTags } = useTags();
  const tenantMembers = members?.map((member) => member.user);
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
            <BreadcrumbPage>Create New</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex justify-between">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Create New Contact</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Add a new contact to your workspace. Fill in the information below.
          </p>
        </div>
        <AddTag />
      </div>

      {/* Contact form */}
      {loadingMembers || loadingTags ? (
        <div className="w-full h-[60vh] flex flex-col justify-center items-center gap-4">
          <Spinner className="w-20 h-20" />
          <p className="text-muted-foreground animate-pulse duration-300">
            Please wait as we load the form...
          </p>
        </div>
      ) : (
        <CreateContactForm
          teamMembers={tenantMembers as CreateContactFormProps["teamMembers"]}
          availableTags={tags as CreateContactFormProps["availableTags"]}
        />
      )}
    </div>
  );
};

export default CreateContactPage;
