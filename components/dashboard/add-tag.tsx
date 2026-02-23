"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { AlertCircleIcon, TagIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Resolver } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useCreateTag } from "@/hooks/use-tag";
import { Alert, AlertTitle } from "../ui/alert";
import { Spinner } from "../ui/spinner";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  color: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddTag = () => {
  const [open, setOpen] = useState(false);

  const addTagMutation = useCreateTag();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      name: "",
      color: "",
      description: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      addTagMutation.mutateAsync(
        { ...data, color: data.color ?? "" },
        {
          onSuccess: () => {
            toast.success("Tag created successfully!");
            setOpen(false);
            form.reset();
          },
          onError: (error) => {
            console.error("Tag creation error:", error);
            toast.error("Failed to create Tag. Please try again.");
            if (error instanceof Error) {
              toast.error(error.message);
            }
          },
        },
      );
    } catch (error) {
      toast.error(error as string);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"}>
          <TagIcon className="w-4 h-4" />
          Add Tag
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tag</DialogTitle>
        </DialogHeader>
        <div>
          <form
            id="add-tag-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Error Alert */}
            {addTagMutation.isError && (
              <Alert variant="destructive">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>{addTagMutation.error.message}</AlertTitle>
              </Alert>
            )}
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">
                      Tag <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="name"
                      placeholder="e.g. VIP, Startup, etc."
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
                name="color"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="color">Color</FieldLabel>
                    <Input
                      {...field}
                      id="color"
                      placeholder="#ffffff, #ff3300"
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
            </FieldGroup>
          </form>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            form="add-tag-form"
            disabled={addTagMutation.isPending}
          >
            {addTagMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Spinner className="w-4 h-4" />
                <span>Adding...</span>
              </span>
            ) : (
              "Add Tag"
            )}
          </Button>
          <Button
            variant={"destructive"}
            onClick={() => setOpen(false)}
            disabled={addTagMutation.isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTag;
