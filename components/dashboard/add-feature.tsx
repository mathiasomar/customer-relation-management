"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { AlertCircleIcon, Plus } from "lucide-react";
import * as z from "zod";
import { useState } from "react";
import { Controller, Resolver, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Alert, AlertTitle } from "../ui/alert";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Spinner } from "../ui/spinner";
import { useCreateFeature } from "@/hooks/use-subscription";
import { Input } from "../ui/input";

const formSchema = z.object({
  feature: z.string().min(1, "Set a feature"),
});

const AddFeature = ({ subscriptionId }: { subscriptionId: string }) => {
  const [open, setOpen] = useState(false);

  const addFeatureMutation = useCreateFeature();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      feature: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    try {
      addFeatureMutation.mutateAsync(
        {
          feature: data.feature,
          subscriptionId: subscriptionId,
        },
        {
          onSuccess: () => {
            setOpen(false);
            form.reset();
            toast.success("Feature added successfully!");
          },
          onError: (error) => {
            // Error is already handled by react-hot-toast in onError,
            // but we can add additional UI feedback here
            console.error("Feature submission error:", error);

            toast.error("Failed to add feature. Please try again.");
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} size={"icon-sm"}>
          <Plus className="w-2 h-2 text-blue-400" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Feature</DialogTitle>
          <DialogDescription>Add feture to the subscription</DialogDescription>
        </DialogHeader>
        {addFeatureMutation.isError && (
          <div className="my-2 p-4">
            <Alert variant={"destructive"}>
              <AlertCircleIcon />
              <AlertTitle>{addFeatureMutation.error.message}</AlertTitle>
            </Alert>
          </div>
        )}
        <form onSubmit={form.handleSubmit(onSubmit)} id="subform">
          <FieldGroup>
            <Controller
              name="feature"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="feature">Feature</FieldLabel>
                  <Input
                    {...field}
                    id="feature"
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
        <DialogFooter>
          <Button
            form="subform"
            type="submit"
            disabled={addFeatureMutation.isPending}
          >
            {addFeatureMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Spinner className="w-4 h-4" />
                Adding...
              </span>
            ) : (
              "Add"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFeature;
