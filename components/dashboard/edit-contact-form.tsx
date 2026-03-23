"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Resolver } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertCircleIcon,
  Upload,
  X,
  Twitter,
  Linkedin,
  Facebook,
  MapPin,
  Building2,
  Briefcase,
  Mail,
  Phone,
  Tag,
  File,
  ArrowLeft,
  Trash2,
} from "lucide-react";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDeleteContact, useUpdateContact } from "@/hooks/use-contact";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { Contact } from "@/generated/prisma/browser";
import Link from "next/link";
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
} from "../ui/alert-dialog";

// Extended schema with all contact fields
const formSchema = z.object({
  // Basic Information
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z
    .string()
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email format",
    )
    .optional()
    .nullable(),
  phone: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),

  // Professional Information
  jobTitle: z.string().max(100).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  company: z.string().max(200).optional().nullable(),

  // Address
  street: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),

  // Social Media
  linkedin: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9_-]+\/?$/.test(
          value,
        ),
      {
        message: "Invalid LinkedIn URL",
      },
    ),

  twitter: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]{1,15}\/?$/.test(
          value,
        ),
      {
        message: "Invalid Twitter/X URL",
      },
    ),

  facebook: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (value) =>
        !value || // allow undefined, null, empty string
        /^(https?:\/\/)?(www\.)?facebook\.com\/(profile\.php\?id=\d+|[A-Za-z0-9\.]{5,})\/?$/.test(
          value,
        ),
      {
        message: "Invalid Facebook URL",
      },
    ),

  // Additional Info
  timezone: z.string().default("UTC"),
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),

  // Relations
  assigneeId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),

  // Avatar (base64 string)
  avatar: z.string().optional().nullable(),

  // status
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

// Country list for dropdown
const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Japan",
  "China",
  "India",
  "Brazil",
  "Mexico",
  "South Africa",
  "Nigeria",
  "Kenya",
  "UAE",
  "Singapore",
].sort();

// Timezone options
const timezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Rome",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
  "Africa/Nairobi",
];

// Source options
const sources = [
  "Website",
  "Referral",
  "LinkedIn",
  "Twitter",
  "Facebook",
  "Email Campaign",
  "Event",
  "Cold Call",
  "Partner",
  "Other",
];

const UNASSIGNED_VALUE = "__unassigned__";

interface EditContactFormProps {
  contact: Contact & {
    tags?: { tag: { id: string } }[];
    assignee?: { id: string; name: string; image?: string | null } | null;
  };
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
  initialTags?: string[];
}

const EditContactForm = ({
  contact,
  teamMembers,
  availableTags,
  initialTags = [],
}: EditContactFormProps) => {
  const router = useRouter();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    contact.avatar || null,
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateContactMutation = useUpdateContact(contact.id);
  const deleteContactMutation = useDeleteContact();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      email: contact.email || "",
      phone: contact.phone || "",
      mobile: contact.mobile || "",
      jobTitle: contact.jobTitle || "",
      department: contact.department || "",
      company: contact.company || "",
      street: contact.street || "",
      city: contact.city || "",
      state: contact.state || "",
      postalCode: contact.postalCode || "",
      country: contact.country || "",
      linkedin: contact.linkedin || "",
      twitter: contact.twitter || "",
      facebook: contact.facebook || "",
      timezone: contact.timezone || "UTC",
      source: contact.source || "",
      notes: contact.notes || "",
      assigneeId: contact.assigneeId || "",
      tags: initialTags,
      avatar: contact.avatar || "",
      isActive: contact.isActive ?? true,
    },
  });

  // Update form when contact changes
  useEffect(() => {
    form.reset({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      mobile: contact.mobile,
      jobTitle: contact.jobTitle,
      department: contact.department,
      company: contact.company,
      street: contact.street,
      city: contact.city,
      state: contact.state,
      postalCode: contact.postalCode,
      country: contact.country,
      linkedin: contact.linkedin,
      twitter: contact.twitter,
      facebook: contact.facebook,
      timezone: contact.timezone || "UTC",
      source: contact.source,
      notes: contact.notes,
      assigneeId: contact.assigneeId,
      tags: initialTags,
      avatar: contact.avatar,
      isActive: contact.isActive,
    });
    setSelectedTags(initialTags);
  }, [contact, form, initialTags]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      // Add selected tags to data
      data.tags = selectedTags;

      updateContactMutation.mutateAsync(data, {
        onSuccess: () => {
          toast.success("Contact updated successfully!");
          form.reset();
        },
        onError: (error) => {
          console.error("Contact update error:", error);
          toast.error("Failed to update contact. Please try again.");
          if (error instanceof Error) {
            toast.error(error.message);
          }
        },
      });
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error(
          "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
        );
        return;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        form.setValue("avatar", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedImage);
      formData.append("upload_preset", "boutique");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // console.log(data);
        toast.success("Avatar uploaded successfully!");
        form.setValue("avatar", data.secure_url);
      }
    } catch (error) {
      console.log(error);
      toast.error("Upload failed. Please try again.");
      setUploading(false);
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    form.setValue("avatar", "");
  };

  const handleTagSelect = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const getInitials = () => {
    const firstName = form.watch("firstName");
    const lastName = form.watch("lastName");
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return "CN";
  };

  const handleDelete = async () => {
    try {
      deleteContactMutation.mutateAsync(contact.id, {
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Alert */}
      {updateContactMutation.isError && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>{updateContactMutation.error.message}</AlertTitle>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={updateContactMutation.isPending}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={updateContactMutation.isPending}
            asChild
          >
            <Link href={`/dashboard/contacts/${contact.id}`}>Cancel</Link>
          </Button>
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={deleteContactMutation.isPending}
              >
                {deleteContactMutation.isPending ? (
                  <Spinner />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {deleteContactMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  contact.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Avatar and Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Upload a photo for this contact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-muted">
                    <AvatarImage src={avatarPreview || undefined} />
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                      onClick={removeAvatar}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="w-full space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                    id="avatar-select"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={uploading}
                    onClick={() =>
                      document.getElementById("avatar-select")?.click()
                    }
                  >
                    <File className="mr-2 h-4 w-4" />
                    Select Photo
                  </Button>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleAvatarUpload}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Spinner />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {uploading ? "Uploading..." : "Upload Photo"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Card */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
              <CardDescription>
                Assign this contact to a team member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                name="assigneeId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="assigneeId">Assign To</FieldLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === UNASSIGNED_VALUE ? "" : value)
                      }
                      value={field.value || ""}
                    >
                      <SelectTrigger id="assigneeId">
                        <SelectValue placeholder="Select a team member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UNASSIGNED_VALUE}>
                          Unassigned
                        </SelectItem>
                        {teamMembers &&
                          teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage
                                    src={member.image || undefined}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {member.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{member.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </CardContent>
          </Card>

          {/* Tags Card */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Categorize this contact with tags
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    {selectedTags.length > 0
                      ? `${selectedTags.length} tag(s) selected`
                      : "Select tags"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search tags..." />
                    <CommandEmpty>No tags found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {availableTags &&
                        availableTags.map((tag) => (
                          <CommandItem
                            key={tag.id}
                            onSelect={() => handleTagSelect(tag.id)}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: tag.color || "#808080",
                                }}
                              />
                              <span>{tag.name}</span>
                              {selectedTags.includes(tag.id) && (
                                <span className="ml-auto text-primary">✓</span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Selected Tags Display */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedTags.map((tagId) => {
                    const tag = availableTags.find((t) => t.id === tagId);
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
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => handleTagSelect(tagId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Enter the contact&apos;s details below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                <Tabs defaultValue="basic" className="space-y-4">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="professional">Professional</TabsTrigger>
                    <TabsTrigger value="address">Address</TabsTrigger>
                    <TabsTrigger value="additional">Additional</TabsTrigger>
                  </TabsList>

                  {/* Basic Information Tab */}
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="firstName"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="firstName">
                              First Name{" "}
                              <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                              {...field}
                              id="firstName"
                              placeholder="John"
                              aria-invalid={fieldState.invalid}
                              autoComplete="off"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Controller
                        name="lastName"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="lastName">
                              Last Name{" "}
                              <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                              {...field}
                              id="lastName"
                              placeholder="Doe"
                              aria-invalid={fieldState.invalid}
                              autoComplete="off"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                value={field.value || ""}
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                className="pl-9"
                                aria-invalid={fieldState.invalid}
                                autoComplete="off"
                              />
                            </div>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Controller
                        name="phone"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="phone">Phone</FieldLabel>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                value={field.value || ""}
                                id="phone"
                                placeholder="+1 234 567 890"
                                className="pl-9"
                                aria-invalid={fieldState.invalid}
                                autoComplete="off"
                              />
                            </div>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>

                    <Controller
                      name="mobile"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="mobile">Mobile</FieldLabel>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              value={field.value || ""}
                              id="mobile"
                              placeholder="+1 234 567 890"
                              className="pl-9"
                              aria-invalid={fieldState.invalid}
                              autoComplete="off"
                            />
                          </div>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </TabsContent>

                  {/* Professional Information Tab */}
                  <TabsContent value="professional" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="jobTitle"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="jobTitle">
                              Job Title
                            </FieldLabel>
                            <div className="relative">
                              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                value={field.value || ""}
                                id="jobTitle"
                                placeholder="Software Engineer"
                                className="pl-9"
                                aria-invalid={fieldState.invalid}
                                autoComplete="off"
                              />
                            </div>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Controller
                        name="department"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="department">
                              Department
                            </FieldLabel>
                            <Input
                              {...field}
                              value={field.value || ""}
                              id="department"
                              placeholder="Engineering"
                              aria-invalid={fieldState.invalid}
                              autoComplete="off"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>

                    <Controller
                      name="company"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="company">Company</FieldLabel>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              value={field.value || ""}
                              id="company"
                              placeholder="Acme Inc."
                              className="pl-9"
                              aria-invalid={fieldState.invalid}
                              autoComplete="off"
                            />
                          </div>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </TabsContent>

                  {/* Address Tab */}
                  <TabsContent value="address" className="space-y-4">
                    <Controller
                      name="street"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="street">
                            Street Address
                          </FieldLabel>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              value={field.value || ""}
                              id="street"
                              placeholder="123 Main St"
                              className="pl-9"
                              aria-invalid={fieldState.invalid}
                              autoComplete="off"
                            />
                          </div>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="city"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="city">City</FieldLabel>
                            <Input
                              {...field}
                              value={field.value || ""}
                              id="city"
                              placeholder="New York"
                              aria-invalid={fieldState.invalid}
                              autoComplete="off"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Controller
                        name="state"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="state">
                              State/Province
                            </FieldLabel>
                            <Input
                              {...field}
                              value={field.value || ""}
                              id="state"
                              placeholder="NY"
                              aria-invalid={fieldState.invalid}
                              autoComplete="off"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="postalCode"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="postalCode">
                              Postal Code
                            </FieldLabel>
                            <Input
                              {...field}
                              value={field.value || ""}
                              id="postalCode"
                              placeholder="10001"
                              aria-invalid={fieldState.invalid}
                              autoComplete="off"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Controller
                        name="country"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="country">Country</FieldLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value || undefined}
                            >
                              <SelectTrigger id="country">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem key={country} value={country}>
                                    {country}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Additional Information Tab */}
                  <TabsContent value="additional" className="space-y-4">
                    {/* Social Media */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Social Media</h3>

                      <Controller
                        name="linkedin"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="linkedin">LinkedIn</FieldLabel>
                            <div className="relative">
                              <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                value={field.value || ""}
                                id="linkedin"
                                placeholder="https://linkedin.com/in/username"
                                className="pl-9"
                                aria-invalid={fieldState.invalid}
                                autoComplete="off"
                              />
                            </div>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Controller
                        name="twitter"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="twitter">Twitter</FieldLabel>
                            <div className="relative">
                              <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                value={field.value || ""}
                                id="twitter"
                                placeholder="@username"
                                className="pl-9"
                                aria-invalid={fieldState.invalid}
                                autoComplete="off"
                              />
                            </div>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Controller
                        name="facebook"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="facebook">Facebook</FieldLabel>
                            <div className="relative">
                              <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                value={field.value || ""}
                                id="facebook"
                                placeholder="https://facebook.com/username"
                                className="pl-9"
                                aria-invalid={fieldState.invalid}
                                autoComplete="off"
                              />
                            </div>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>

                    <Separator />

                    {/* Other Information */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Other Information</h3>

                      <div className="grid grid-cols-2 gap-4">
                        <Controller
                          name="timezone"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="timezone">
                                Timezone
                              </FieldLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger id="timezone">
                                  <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                  {timezones.map((tz) => (
                                    <SelectItem key={tz} value={tz}>
                                      {tz}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />

                        <Controller
                          name="source"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="source">
                                Lead Source
                              </FieldLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value || undefined}
                              >
                                <SelectTrigger id="source">
                                  <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sources.map((source) => (
                                    <SelectItem key={source} value={source}>
                                      {source}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                      </div>

                      <Controller
                        name="notes"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="notes">Notes</FieldLabel>
                            <Textarea
                              {...field}
                              value={field.value || ""}
                              id="notes"
                              placeholder="Add any additional notes about this contact..."
                              className="min-h-25"
                              aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/contacts`)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={updateContactMutation.isPending}>
          {updateContactMutation.isPending ? "Updating..." : "Update Contact"}
        </Button>
      </div>
    </form>
  );
};

export default EditContactForm;
