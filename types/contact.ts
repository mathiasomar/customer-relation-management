import { Contact, Tag, User } from "@/generated/prisma/client";

export interface ContactWithRelations extends Contact {
  assignee?: Pick<User, "id" | "name" | "email" | "image"> | null;
  tags?: (Tag & { tag: Tag })[];
  _count?: {
    leads: number;
    opportunities: number;
    deals: number;
    activities: number;
    notesList: number;
    tasks: number;
  };
}

export interface ContactFilters {
  search?: string;
  assigneeId?: string;
  tags?: string[];
  isActive?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  company?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateContactInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  company?: string;
  avatar?: string;
  timezone?: string;

  // Address
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  // Social
  linkedin?: string;
  twitter?: string;
  facebook?: string;

  // Metadata
  source?: string;
  notes?: string;

  // Relations
  assigneeId?: string;
  tags?: string[]; // Tag IDs
  customFields?: Record<string, unknown>;
}

export interface UpdateContactInput extends Partial<CreateContactInput> {
  id: string;
  isActive?: boolean;
}

export interface ContactListResponse {
  data: ContactWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
