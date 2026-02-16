"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Search,
  X,
  Filter,
  ChevronDown,
  Calendar as CalendarIcon,
  Users,
  Building2,
  Tag,
  Check,
  RotateCcw,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "@/hooks/use-debounce";

import { ContactFilters } from "@/types/contact";
import { useTenantMembers } from "@/hooks/use-tenant";
import { useExportContacts, useTags } from "@/hooks/use-contact";

// const filterSchema = z.object({
//   search: z.string().optional(),
//   assigneeId: z.string().optional(),
//   tags: z.array(z.string()).optional(),
//   isActive: z.boolean().optional(),
//   company: z.string().optional(),
//   dateRange: z
//     .object({
//       from: z.date().optional(),
//       to: z.date().optional(),
//     })
//     .optional(),
//   sortBy: z
//     .enum([
//       "firstName",
//       "lastName",
//       "email",
//       "company",
//       "createdAt",
//       "lastContactedAt",
//     ])
//     .optional(),
//   sortOrder: z.enum(["asc", "desc"]).optional(),
// });

// type FilterValues = z.infer<typeof filterSchema>;

interface ContactFiltersProps {
  initialFilters?: ContactFilters;
  onFilterChange?: (filters: ContactFilters) => void;
  showExport?: boolean;
  totalCount?: number;
}

// Date range presets
const datePresets = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 days", value: "last7" },
  { label: "Last 30 days", value: "last30" },
  { label: "This month", value: "thisMonth" },
  { label: "Last month", value: "lastMonth" },
  { label: "This year", value: "thisYear" },
  { label: "Custom", value: "custom" },
];

export function ContactFiltersSection({
  initialFilters = {},
  onFilterChange,
  showExport = true,
  totalCount = 0,
}: ContactFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || "");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(
    initialFilters.assigneeId || null,
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialFilters.tags || [],
  );
  const [selectedCompany, setSelectedCompany] = useState<string | null>(
    initialFilters.company || null,
  );
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>(
    initialFilters.dateRange || {},
  );
  const [showInactive, setShowInactive] = useState(
    initialFilters.isActive === false,
  );
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || "createdAt");
  const [sortOrder, setSortOrder] = useState(
    initialFilters.sortOrder || "desc",
  );
  const [datePreset, setDatePreset] = useState<string>("custom");

  // Fetch data for filters
  const { data: membersData, isLoading: membersLoading } = useTenantMembers();
  const { data: tagsData, isLoading: tagsLoading } = useTags();
  const exportContacts = useExportContacts();

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    // Update search params
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    if (selectedAssignee) {
      params.set("assigneeId", selectedAssignee);
    } else {
      params.delete("assigneeId");
    }

    if (selectedTags.length > 0) {
      params.set("tags", selectedTags.join(","));
    } else {
      params.delete("tags");
    }

    if (selectedCompany) {
      params.set("company", selectedCompany);
    } else {
      params.delete("company");
    }

    if (showInactive) {
      params.set("showInactive", "true");
    } else {
      params.delete("showInactive");
    }

    if (dateRange.from) {
      params.set("from", dateRange.from.toISOString());
    } else {
      params.delete("from");
    }

    if (dateRange.to) {
      params.set("to", dateRange.to.toISOString());
    } else {
      params.delete("to");
    }

    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", "1"); // Reset to first page on filter change

    router.push(`${pathname}?${params.toString()}`);

    // Call onFilterChange if provided
    if (onFilterChange) {
      onFilterChange({
        search: debouncedSearch,
        assigneeId: selectedAssignee || undefined,
        tags: selectedTags,
        isActive: !showInactive,
        company: selectedCompany || undefined,
        dateRange:
          dateRange.from || dateRange.to
            ? (dateRange as { from: Date; to: Date })
            : undefined,
        sortBy: sortBy,
        sortOrder: sortOrder,
      });
    }
  }, [
    debouncedSearch,
    selectedAssignee,
    selectedTags,
    selectedCompany,
    showInactive,
    dateRange,
    sortBy,
    sortOrder,
    pathname,
    router,
    searchParams,
    onFilterChange,
  ]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedAssignee(null);
    setSelectedTags([]);
    setSelectedCompany(null);
    setShowInactive(false);
    setDateRange({});
    setDatePreset("custom");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const hasActiveFilters =
    debouncedSearch ||
    selectedAssignee ||
    selectedTags.length > 0 ||
    selectedCompany ||
    showInactive ||
    dateRange.from ||
    dateRange.to;

  const getAssigneeName = (id: string) => {
    const member = membersData?.find((m) => m.user.id === id);
    return member?.user.name || id;
  };

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
      case "today":
        setDateRange({ from: today, to: today });
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        setDateRange({ from: yesterday, to: yesterday });
        break;
      case "last7":
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        setDateRange({ from: last7, to: today });
        break;
      case "last30":
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        setDateRange({ from: last30, to: today });
        break;
      case "thisMonth":
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setDateRange({ from: firstDay, to: lastDay });
        break;
      case "lastMonth":
        const firstDayLast = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1,
        );
        const lastDayLast = new Date(today.getFullYear(), today.getMonth(), 0);
        setDateRange({ from: firstDayLast, to: lastDayLast });
        break;
      case "thisYear":
        const firstDayYear = new Date(today.getFullYear(), 0, 1);
        const lastDayYear = new Date(today.getFullYear(), 11, 31);
        setDateRange({ from: firstDayYear, to: lastDayYear });
        break;
      default:
        // Keep custom range
        break;
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportContacts.mutateAsync({
        search: debouncedSearch,
        assigneeId: selectedAssignee || undefined,
        tags: selectedTags,
        isActive: !showInactive,
        company: selectedCompany || undefined,
        dateRange:
          dateRange.from || dateRange.to
            ? (dateRange as { from: Date; to: Date })
            : undefined,
      });

      // Convert to CSV and download
      if (data) {
        const headers = Object.keys(data[0]).join(",");
        const rows = data.map((row) =>
          Object.values(row)
            .map((value) =>
              typeof value === "string" && value.includes(",")
                ? `"${value}"`
                : value,
            )
            .join(","),
        );

        const csv = [headers, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contacts-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts by name, email, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {/* Filter Sheet */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  >
                    {[
                      selectedAssignee ? 1 : 0,
                      selectedTags.length,
                      selectedCompany ? 1 : 0,
                      showInactive ? 1 : 0,
                      dateRange.from || dateRange.to ? 1 : 0,
                    ].reduce((a, b) => a + b, 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filter Contacts</SheetTitle>
                <SheetDescription>
                  Narrow down your contacts using multiple criteria
                </SheetDescription>
              </SheetHeader>

              <div className="py-6 space-y-6">
                {/* Assignee Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Assigned To
                  </Label>
                  <Select
                    value={selectedAssignee || ""}
                    onValueChange={(value) =>
                      setSelectedAssignee(value || null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All assignees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All assignees</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {membersLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : (
                        membersData?.map((member) => (
                          <SelectItem
                            key={member.user.id}
                            value={member.user.id}
                          >
                            {member.user.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center">
                    <Tag className="mr-2 h-4 w-4" />
                    Tags
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {selectedTags.length > 0
                          ? `${selectedTags.length} tag(s) selected`
                          : "Select tags"}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search tags..." />
                        <CommandEmpty>No tags found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {tagsLoading ? (
                            <CommandItem disabled>Loading...</CommandItem>
                          ) : (
                            tagsData?.map((tag: any) => (
                              <CommandItem
                                key={tag.id}
                                onSelect={() => {
                                  setSelectedTags((prev) =>
                                    prev.includes(tag.id)
                                      ? prev.filter((id) => id !== tag.id)
                                      : [...prev, tag.id],
                                  );
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor: tag.color || "#808080",
                                    }}
                                  />
                                  <span>{tag.name}</span>
                                  {selectedTags.includes(tag.id) && (
                                    <Check className="ml-auto h-4 w-4" />
                                  )}
                                </div>
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Selected Tags */}
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedTags.map((tagId) => {
                        const tag = tagsData?.find((t: any) => t.id === tagId);
                        return tag ? (
                          <Badge
                            key={tagId}
                            variant="secondary"
                            className="flex items-center gap-1"
                            style={{
                              backgroundColor: tag.color
                                ? `${tag.color}20`
                                : undefined,
                              borderColor: tag.color ?? "",
                            }}
                          >
                            {tag.name}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() =>
                                setSelectedTags((prev) =>
                                  prev.filter((id) => id !== tagId),
                                )
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                {/* Company Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center">
                    <Building2 className="mr-2 h-4 w-4" />
                    Company
                  </Label>
                  <Input
                    placeholder="Filter by company name"
                    value={selectedCompany || ""}
                    onChange={(e) => setSelectedCompany(e.target.value || null)}
                  />
                </div>

                {/* Date Range Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Created Date
                  </Label>

                  <Select
                    value={datePreset}
                    onValueChange={handleDatePresetChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      {datePresets.map((preset) => (
                        <SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {(datePreset === "custom" ||
                    dateRange.from ||
                    dateRange.to) && (
                    <div className="border rounded-md p-3 space-y-3">
                      <div className="grid gap-2">
                        <Label>From</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.from ? (
                                format(dateRange.from, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={dateRange.from}
                              onSelect={(date) =>
                                setDateRange((prev) => ({
                                  ...prev,
                                  from: date,
                                }))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="grid gap-2">
                        <Label>To</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.to ? (
                                format(dateRange.to, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={dateRange.to}
                              onSelect={(date) =>
                                setDateRange((prev) => ({ ...prev, to: date }))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Filter */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showInactive"
                    checked={showInactive}
                    onCheckedChange={(checked) =>
                      setShowInactive(checked as boolean)
                    }
                  />
                  <Label htmlFor="showInactive">
                    Include inactive contacts
                  </Label>
                </div>

                <Separator />

                {/* Sort Options */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="firstName">First Name</SelectItem>
                      <SelectItem value="lastName">Last Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="lastContactedAt">
                        Last Contacted
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortOrder}
                    onValueChange={(value) =>
                      setSortOrder(value as "asc" | "desc")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <SheetFooter className="flex flex-row gap-2 sm:flex-col">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Clear All Filters
                </Button>
                <SheetClose asChild>
                  <Button className="w-full">Apply Filters</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Sort
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {[
                  { value: "firstName", label: "First Name" },
                  { value: "lastName", label: "Last Name" },
                  { value: "email", label: "Email" },
                  { value: "company", label: "Company" },
                  { value: "createdAt", label: "Created Date" },
                  { value: "lastContactedAt", label: "Last Contacted" },
                ].map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className="flex items-center justify-between"
                  >
                    {option.label}
                    {sortBy === option.value && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setSortOrder("asc")}>
                  <div className="flex items-center justify-between w-full">
                    Ascending
                    {sortOrder === "asc" && <Check className="h-4 w-4" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("desc")}>
                  <div className="flex items-center justify-between w-full">
                    Descending
                    {sortOrder === "desc" && <Check className="h-4 w-4" />}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export Button */}
          {showExport && (
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exportContacts.isPending}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
              {totalCount > 0 && (
                <span className="ml-1 text-muted-foreground">
                  ({totalCount})
                </span>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {debouncedSearch && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: &quot;{debouncedSearch}&quot;
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {selectedAssignee && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Assignee: {getAssigneeName(selectedAssignee)}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => setSelectedAssignee(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {selectedTags.map((tagId) => {
            const tag = tagsData?.find((t: any) => t.id === tagId);
            return tag ? (
              <Badge
                key={tagId}
                variant="secondary"
                className="flex items-center gap-1"
                style={{
                  backgroundColor: tag.color ? `${tag.color}20` : undefined,
                }}
              >
                {tag.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() =>
                    setSelectedTags((prev) => prev.filter((id) => id !== tagId))
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null;
          })}

          {selectedCompany && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Company: {selectedCompany}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => setSelectedCompany(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {showInactive && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Showing inactive
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => setShowInactive(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {(dateRange.from || dateRange.to) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date: {dateRange.from ? format(dateRange.from, "MMM d") : "..."} -{" "}
              {dateRange.to ? format(dateRange.to, "MMM d") : "..."}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => {
                  setDateRange({});
                  setDatePreset("custom");
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
