export interface ContactFilters {
  search?: string;
  assigneeId?: string;
  tags?: string[];
  isActive?: boolean;
  company?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateContactFormProps {
  teamMembers: Array<{
    id: string;
    name: string;
    email: string;
    image?: string | null;
  }>;
  availableTags: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
}

export interface CreateContactInput {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  company?: string | null;
  avatar?: string | null;
  timezone?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  source?: string | null;
  notes?: string | null;
  assigneeId?: string | null;
  tags?: string[];
}
