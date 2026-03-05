import {
  Activity,
  Contact,
  Deal,
  Lead,
  Note,
  Opportunity,
  Pipeline,
  Tag,
  TagAssignment,
  Task,
  User,
} from "@/generated/prisma/client";

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

// Base types for selected fields
type UserAssignee = Pick<User, "id" | "name" | "email" | "image">;
type UserCreator = Pick<User, "id" | "name" | "image">;
type UserAuthor = Pick<User, "id" | "name" | "image">;
type PipelineInfo = Pick<Pipeline, "id" | "name" | "description" | "isDefault">;

export interface ContactTag extends TagAssignment {
  tag: Tag;
  assignedBy: UserCreator | null;
}

// Opportunity with pipeline
export interface ContactOpportunity extends Opportunity {
  pipeline: PipelineInfo | null;
}

// Activity with relations
export interface ContactActivity extends Activity {
  assignee: UserAssignee | null;
  creator: UserCreator;
}

// Note with author
export interface ContactNote extends Note {
  author: UserAuthor;
}

// Task with assignee
export interface ContactTask extends Task {
  assignee: UserAssignee;
}

export interface ContactCounts {
  leads: number;
  opportunities: number;
  deals: number;
  activities: number;
  notesList: number;
  tasks: number;
}

export interface ContactType extends Contact {
  assignee: User | null;
  tags: ContactTag[];
  leads: Lead[];
  opportunities: ContactOpportunity[];
  deals: Deal[];
  activities: ContactActivity[];
  notesList: ContactNote[];
  tasks: ContactTask[];
  _count: ContactCounts;
}
