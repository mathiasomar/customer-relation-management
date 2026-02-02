"use client";

import { useSubscription } from "@/hooks/use-subscription";
import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Resolver } from "react-hook-form";
import * as z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const formSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(12, "Phone number must be at most 12 characters")
    .regex(/^(?:254|\+254|0)?(7\d{8})$/, {
      message:
        "Invalid Kenyan phone number. Format: 0712345678, 712345678, +254712345678",
    }),
});

const MpesaForm = ({ subId }: { subId: string }) => {
  const { data, isFetching } = useSubscription(subId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    // try {
    //   addTenantMutation.mutateAsync(data, {
    //     onSuccess: () => {
    //       setOpen(false);
    //       form.reset();
    //       toast.success("Organization added successfully!");
    //     },
    //     onError: (error) => {
    //       // Error is already handled by react-hot-toast in onError,
    //       // but we can add additional UI feedback here
    //       console.error("Organization submission error:", error);
    //       toast.error("Failed to add organization. Please try again.");
    //       if (error instanceof Error) {
    //         toast.error(error.message);
    //       }
    //       // Other errors are handled by the default toast in onError
    //     },
    //   });
    // } catch (error) {
    //   toast.error(error as string);
    // }
  };
  return (
    <div className="p-2 my-4 border rounded-lg flex flex-col items-center">
      <Image
        src="https://png.co.ke/wp-content/uploads/2023/02/Mpesa-Logo.png"
        alt="mpesa"
        width={150}
        height={50}
      />
      <span className="text-sm text-muted-foreground">
        Use kenya most common used moble payment method
      </span>
      <div className="my-4 min-w-md rounded-lg">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="phone">Payment Number</FieldLabel>
                  <Input
                    {...field}
                    id="phone"
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
          <Button
            disabled={isFetching}
            type="submit"
            className="mt-6 w-full bg-green-100 text-green-800 hover:bg-green-800 hover:text-green-100"
          >
            Pay
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MpesaForm;
