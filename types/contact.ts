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
