"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Resolver } from "react-hook-form";
import * as z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { AlertCircleIcon, Plus } from "lucide-react";
import { Alert, AlertTitle } from "../ui/alert";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateSubscrciption } from "@/hooks/use-subscription";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";

const formSchema = z.object({
  plan: z.string().min(1, "Set a plan"),
  description: z.string().optional(),
  amount: z.coerce.number().min(0, "Amount must be at least 0").default(0),
  popular: z.boolean().default(false),
  maxMembers: z.coerce
    .number()
    .min(0, "Max members must be at least 0")
    .default(0),
  maxContacts: z.coerce
    .number()
    .min(0, "Max contacts must be at least 0")
    .default(0),
  maxDeals: z.coerce.number().min(0, "Max deals must be at least 0").default(0),
  storageGB: z.coerce.number().min(0, "Storage must be at least 0").default(0),
  customFields: z.coerce
    .number()
    .min(0, "Custom fields must be at least 0")
    .default(0),
});

const AddSubscription = () => {
  const [open, setOpen] = useState(false);
  const addSubscriptionMutation = useCreateSubscrciption();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      plan: "",
      description: "",
      amount: 0,
      popular: false,
      maxMembers: 0,
      maxContacts: 0,
      maxDeals: 0,
      storageGB: 0,
      customFields: 0,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    const limits = {
      maxMembers: data.maxMembers,
      maxContacts: data.maxContacts,
      maxDeals: data.maxDeals,
      storageGB: data.storageGB,
      customFields: data.customFields,
    };
    try {
      addSubscriptionMutation.mutateAsync(
        { ...data, limits },
        {
          onSuccess: () => {
            setOpen(false);
            form.reset();
            toast.success("Subscription added successfully!");
          },
          onError: (error) => {
            // Error is already handled by react-hot-toast in onError,
            // but we can add additional UI feedback here
            console.error("Subscription submission error:", error);

            toast.error("Failed to add Subscription. Please try again.");
            if (error instanceof Error) {
              toast.error(error.message);
            }
            // Other errors are handled by the default toast in onError
          },
        },
      );
    } catch (error) {
      toast.error(error as string);
    }
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="h-2 w-2" /> New Subscription
        </Button>
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-[85vh] md:h-screen">
          {addSubscriptionMutation.isError && (
            <div className="my-2">
              <Alert variant={"destructive"}>
                <AlertCircleIcon />
                <AlertTitle>{addSubscriptionMutation.error.message}</AlertTitle>
              </Alert>
            </div>
          )}
          <SheetHeader>
            <SheetTitle className="mb-4">Add Subscription</SheetTitle>
            <SheetDescription>Add a new Subscription</SheetDescription>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="plan"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="plan">Plan</FieldLabel>
                      <Input
                        {...field}
                        id="plan"
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
                  name="amount"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="amount">Amount</FieldLabel>
                      <Input
                        {...field}
                        id="amount"
                        type="number"
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
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="description">Description</FieldLabel>
                      <Textarea
                        {...field}
                        id="description"
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
                  name="popular"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <span className="flex items-center gap-2">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="popular"
                        />
                        <label className="text-xs max-w-200" htmlFor="popular">
                          Is Popular
                        </label>
                      </span>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <div className="space-y-4">
                  <p className="text-xs font-semibold">Enter limits access</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                    <Controller
                      name="maxMembers"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="maxMembers">Members</FieldLabel>
                          <Input
                            {...field}
                            id="maxMembers"
                            type="number"
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
                      name="maxContacts"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="maxContacts">
                            Contacts
                          </FieldLabel>
                          <Input
                            {...field}
                            id="maxContacts"
                            type="number"
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
                      name="maxDeals"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="maxDeals">Deals</FieldLabel>
                          <Input
                            {...field}
                            id="maxDeals"
                            type="number"
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
                      name="storageGB"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="storageGB">
                            Storage (GB)
                          </FieldLabel>
                          <Input
                            {...field}
                            id="storageGB"
                            type="number"
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
                      name="customFields"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="customFields">
                            Custom Fields
                          </FieldLabel>
                          <Input
                            {...field}
                            id="customFields"
                            type="number"
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
                </div>
              </FieldGroup>

              <Button
                disabled={addSubscriptionMutation.isPending}
                type="submit"
                className="mt-6 w-full"
              >
                {addSubscriptionMutation.isPending
                  ? "Submitting..."
                  : "Add Subscription"}
              </Button>
            </form>
          </SheetHeader>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default AddSubscription;
