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
import { Calendar } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Resolver } from "react-hook-form";
import { toast } from "sonner";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { useCreateTask } from "@/hooks/use-task";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  taskDate: z
    .string()
    .refine(
      (dateString) =>
        new Date(dateString) >= new Date(new Date().toDateString()),
      {
        message: "Task date cannot be in the past",
      },
    ),
});

type FormValues = z.infer<typeof formSchema>;

const AddTaskForm = ({ contactId }: { contactId: string }) => {
  const addTaskMutation = useCreateTask();

  const today = new Date().toISOString().split("T")[0];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      title: "",
      taskDate: today,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      addTaskMutation.mutateAsync(
        { contactId, data: { ...data, taskDate: new Date(data.taskDate) } },
        {
          onSuccess: () => {
            toast.success("Task created successfully!");
            form.reset();
          },
          onError: (error) => {
            console.error("Task creation error:", error);
            toast.error("Failed to create Task. Please try again.");
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
        <CardTitle className="text-base">Create Task</CardTitle>
        <CardDescription>Create a new task for this contact</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="add-task-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    id="name"
                    placeholder="Task title"
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
              name="taskDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    id="taskDate"
                    type="date"
                    placeholder="Due Date"
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
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={!form.formState.isValid || addTaskMutation.isPending}
          type="submit"
          form="add-task-form"
        >
          {addTaskMutation.isPending ? (
            <Spinner className="w-4 h-4" />
          ) : (
            <Calendar className="mr-2 h-4 w-4" />
          )}
          {addTaskMutation.isPending ? "Adding..." : "Add Task"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AddTaskForm;
