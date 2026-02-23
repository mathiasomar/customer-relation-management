"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Resolver } from "react-hook-form";
import { toast } from "sonner";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { useCreateNote } from "@/hooks/use-note";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z.object({
  note: z.string().min(2, "Note must be at least 2 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const AddNoteForm = ({ contactId }: { contactId: string }) => {
  const addNoteMutation = useCreateNote();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      note: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      addNoteMutation.mutateAsync(
        { ...data, contactId },
        {
          onSuccess: () => {
            toast.success("Note created successfully!");
            form.reset();
          },
          onError: (error) => {
            console.error("Note creation error:", error);
            toast.error("Failed to create Note. Please try again.");
            if (error instanceof Error) {
              toast.error(error.message);
            }
          },
        },
      );
      console.log(data);
    } catch (error) {
      toast.error(error as string);
    }
  };
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Add a Note</CardTitle>
        <CardDescription>Write a note about this contact</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="add-note-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="note"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Textarea
                    placeholder="Write your note here..."
                    value={field.value}
                    onChange={field.onChange}
                    className="min-h-25"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={!form.formState.isValid || addNoteMutation.isPending}
          type="submit"
          form="add-note-form"
        >
          {addNoteMutation.isPending ? (
            <Spinner className="w-4 h-4" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          {addNoteMutation.isPending ? "Adding..." : "Add Note"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AddNoteForm;
