import { z } from "zod";

export const createContactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email format").optional().nullable(),
  phone: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  jobTitle: z.string().max(100).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  avatar: z.string().url("Invalid URL").optional().nullable(),
  timezone: z.string().optional().nullable(),

  // Address
  street: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),

  // Social
  linkedin: z
    .string()
    .regex(
      /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+$/,
      "Invalid LinkedIn URL",
    )
    .optional()
    .nullable(),
  twitter: z.string().optional().nullable(),
  facebook: z
    .string()
    .regex(
      /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9_-]+$/,
      "Invalid Facebook URL",
    )
    .optional()
    .nullable(),

  // Metadata
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),

  // Relations
  assigneeId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  customFields: z.record(z.string(), z.any()).optional(),
});

export const updateContactSchema = createContactSchema.partial().extend({
  id: z.string(),
  isActive: z.boolean().optional(),
});

export const contactFiltersSchema = z.object({
  search: z.string().optional(),
  assigneeId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  company: z.string().optional(),
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z
    .enum([
      "firstName",
      "lastName",
      "email",
      "company",
      "createdAt",
      "lastContactedAt",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ContactFilters = z.infer<typeof contactFiltersSchema>;
