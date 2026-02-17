"use client";

import ContactCard from "@/components/dashboard/contact-card";
import { ContactFiltersSection } from "@/components/dashboard/contact-filters";
import { ContactsPagination } from "@/components/dashboard/contact-pagination";
import CardListSkeleton from "@/components/dashboard/loaders/card-list-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useContacts } from "@/hooks/use-contact";
import { ContactFilters } from "@/types/contact";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const ViewContacts = () => {
  const searchParams = useSearchParams();

  const page = searchParams.get("page") || 1;
  const limit = searchParams.get("limit") || 20;

  const filters = {
    page,
    limit,
    search: searchParams.get("search")?.trim() || undefined,
    assigneeId: searchParams.get("assigneeId") || undefined,
    tags: searchParams.get("tags")?.split(",").filter(Boolean),
    company: searchParams.get("company")?.trim() || undefined,
    isActive: searchParams.get("showInactive") !== "true",
    dateRange:
      searchParams.get("from") || searchParams.get("to")
        ? {
            from: searchParams.get("from")
              ? new Date(searchParams.get("from") ?? new Date())
              : undefined,
            to: searchParams.get("to")
              ? new Date(searchParams.get("to") ?? new Date())
              : undefined,
          }
        : undefined,
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
  };
  const { data: contacts, isFetching } = useContacts(filters as ContactFilters);
  return (
    <div className="w-full">
      {isFetching ? (
        <CardListSkeleton columns={3} items={3} />
      ) : contacts?.data?.length === 0 || !contacts?.data ? (
        <div className="w-full h-50">
          <Card className="h-full shadow-none flex items-center justify-center border-dashed border-2">
            <CardContent className="flex flex-col items-center gap-2">
              <h1 className="text-sm text-muted-foreground">No Contacts</h1>
              <Button asChild>
                <Link href="/dashboard/contacts/create">Add Contact</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <ContactFiltersSection
            initialFilters={filters as ContactFilters}
            totalCount={contacts.meta.total}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {contacts.data.map((contact) => (
              <ContactCard key={contact.id} contactId={contact.id} />
            ))}
          </div>
          {contacts.meta && contacts.meta.total > 0 && (
            <ContactsPagination
              currentPage={contacts.meta.page}
              totalPages={contacts.meta.totalPages}
              totalItems={contacts.meta.total}
              pageSize={contacts.meta.limit}
            />
          )}
          {/* Results count summary */}
          <div className="text-center text-sm text-muted-foreground">
            Showing {contacts.data?.length} of {contacts.meta?.total} contacts
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewContacts;
