"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Mail,
  Phone,
  Trash2,
  FileText,
  Calendar,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { Contact } from "@/generated/prisma/browser";
// import { authClient } from "@/lib/auth-client";
import { useDeleteContact } from "@/hooks/use-contact";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

interface ContactHeaderProps {
  contact: Contact;
}

export function ContactHeader({ contact }: ContactHeaderProps) {
  // const { data: session, isPending } = authClient.useSession();
  // const tenant = isPending ? "" : session?.session.tenantId;
  const router = useRouter();
  const deleteContact = useDeleteContact();

  const getInitials = () => {
    return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
  };

  const getFullName = () => {
    return `${contact.firstName} ${contact.lastName}`;
  };

  const handleDelete = async () => {
    try {
      deleteContact.mutateAsync(contact.id, {
        onSuccess: () => {
          toast.success("Contact deleted successfully!");
          router.push(`/dashboard/contacts`);
        },
        onError: (error) => {
          console.error("Contact delete error:", error);
          toast.error("Failed to delete contact. Please try again.");
          if (error instanceof Error) {
            toast.error(error.message);
          }
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete contact",
      );
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <Avatar className="h-16 w-16 border-4 border-muted">
          <AvatarImage src={contact.avatar || undefined} />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {getInitials()}
          </AvatarFallback>
        </Avatar>

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{getFullName()}</h1>
            {!contact.isActive && (
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800"
              >
                Inactive
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 text-muted-foreground">
            {contact.jobTitle && (
              <span className="text-sm">{contact.jobTitle}</span>
            )}
            {contact.company && (
              <>
                <span className="text-sm">•</span>
                <span className="text-sm">{contact.company}</span>
              </>
            )}
            <span className="text-sm">•</span>
            <span className="text-sm">
              Created {format(new Date(contact.createdAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={`mailto:${contact.email}`}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </a>
        </Button>
        {contact.phone && (
          <Button variant="outline" size="sm" asChild>
            <a href={`tel:${contact.phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              Call
            </a>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/contacts/${contact.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Contact
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Meeting
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              Add Note
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={(e) => e.preventDefault()}
                  disabled={deleteContact.isPending}
                >
                  {deleteContact.isPending ? (
                    <Spinner />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  {deleteContact.isPending ? "Deleting..." : "Delete Contact"}
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the contact and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
