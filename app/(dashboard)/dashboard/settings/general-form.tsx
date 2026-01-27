import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tenant } from "@/generated/prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, Resolver, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { TimezoneSelect } from "./timezone-select";
import { AutoDetectLanguageSelect } from "./language-select";
import { CurrencySelect } from "./currency-select";
import { useUpdateTenant } from "@/hooks/use-tenant";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .max(50, { message: "Slug must be at most 50 characters" })
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  website: z
    .string()
    .regex(
      /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,
      { message: "Invalid website URL" },
    )
    .optional()
    .or(z.literal("")),
  industry: z.string().optional(),
  timezone: z.string().default("UTC"),
  currency: z.string().default("USD"),
  language: z.string().default("en"),
  billingEmail: z
    .string()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
      message: "Invalid email address!",
    })
    .optional(),
});

const GeneralForm = ({ tenant }: { tenant: Tenant }) => {
  const updateTenantMutation = useUpdateTenant();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      name: tenant.name ?? "",
      slug: tenant.slug ?? "",
      website: tenant.website ?? "",
      industry: tenant.industry ?? "",
      timezone: tenant.timezone ?? "UTC",
      currency: tenant.currency ?? "USD",
      language: tenant.language ?? "en",
      billingEmail: tenant.billingEmail ?? "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    try {
      updateTenantMutation.mutateAsync(data, {
        onSuccess: () => {
          form.reset();
          toast.success("Tenant updated successfully!");
        },
        onError: (error) => {
          // Error is already handled by react-hot-toast in onError,
          // but we can add additional UI feedback here
          console.error("Tenant submission error:", error);
          toast.error("Failed to update organization. Please try again.");
          if (error instanceof Error) {
            toast.error(error.message);
          }
          // Other errors are handled by the default toast in onError
        },
      });
    } catch (error) {
      toast.error(error as string);
    }
    console.log(data);
  };
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="grid grid-cols-1 md:grid-cols-2">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                {...field}
                id="name"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="slug"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="slug">Slug</FieldLabel>
              <Input
                {...field}
                id="slug"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="website"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="website">Website</FieldLabel>
              <Input
                {...field}
                id="website"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="industry"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="industry">Industry</FieldLabel>
              <Input
                {...field}
                id="industry"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="billingEmail"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="billingEmail">Billing Email</FieldLabel>
              <Input
                {...field}
                id="billingEmail"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <AutoDetectLanguageSelect control={form.control} />
        <TimezoneSelect defaultValue={tenant.timezone} control={form.control} />
        <CurrencySelect defaultValue={tenant.currency} control={form.control} />
      </FieldGroup>
      <div className="flex justify-end mt-4">
        <Button disabled={updateTenantMutation.isPending} size={"sm"}>
          {updateTenantMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Spinner className="w-4 h-4" /> Saving...
            </span>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </form>
  );
};

export default GeneralForm;
