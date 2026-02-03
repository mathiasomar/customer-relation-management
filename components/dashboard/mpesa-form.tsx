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
import { useState } from "react";
import { Spinner } from "../ui/spinner";
import { ApiResponse, STKPushResponse } from "@/types/mpesa.types";
import { toast } from "sonner";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";

const formSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(12, "Phone number must be at most 12 characters")
    .regex(/^(?:254|\+254|0)?([17]\d{8})$/, {
      message: "Invalid phone number format.",
    }),
});

const MpesaForm = ({ subId }: { subId: string }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentResponse, setPaymentResponse] =
    useState<STKPushResponse | null>(null);
  const [error, setError] = useState<string>("");
  const { data: subData, isFetching } = useSubscription(subId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (
    formData,
  ) => {
    setLoading(true);
    setError("");
    setPaymentResponse(null);

    try {
      const res = await fetch("/api/mpesa/stk-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formData.phone,
          amount: isFetching ? 0 : subData?.subscription?.amount,
          accountReference: `ORDER_${Date.now()}`,
          transactionDesc: "Payment for order",
        }),
      });

      const data: ApiResponse<STKPushResponse> = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Payment initiation failed");
      }

      setPaymentResponse(data.data!);

      // Start polling for payment status
      if (data.data?.CheckoutRequestID) {
        pollPaymentStatus(data.data.CheckoutRequestID);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (
    checkoutRequestID: string,
  ): Promise<void> => {
    const maxAttempts = 15; // 45 seconds total (15 * 3 seconds)
    let attempts = 0;

    const pollInterval = setInterval(async (): Promise<void> => {
      attempts++;

      try {
        const response = await fetch("/api/mpesa/query-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ checkoutRequestID }),
        });

        const data: ApiResponse = await response.json();

        if (data.data?.ResultCode === "0") {
          clearInterval(pollInterval);
          toast.success("🎉 Payment successful! Thank you for your purchase.");
          // Reset form on success
          form.reset();
          setPaymentResponse(null);
        } else if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          toast.error(
            "⏰ Payment request timed out. Please check your phone and try again.",
          );
        }
      } catch (error) {
        console.error("Polling error:", error);
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
        }
      }
    }, 3000); // Poll every 3 seconds
  };
  return (
    <div className="p-2 my-4 border rounded-lg flex flex-col items-center">
      {paymentResponse && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="font-semibold text-green-800">
              Payment initiated successfully!
            </h3>
          </div>
          <p className="text-sm text-green-700 mt-2">
            Check your phone for the M-Pesa prompt. Enter your PIN to complete
            the payment.
          </p>
          <div className="mt-3 text-xs text-green-600 space-y-1">
            <p>
              Request ID:{" "}
              <span className="font-mono">
                {paymentResponse.CheckoutRequestID}
              </span>
            </p>
            <p>
              Merchant ID:{" "}
              <span className="font-mono">
                {paymentResponse.MerchantRequestID}
              </span>
            </p>
          </div>
        </div>
      )}
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
        {error && (
          <Alert variant={"destructive"} className="my-4">
            <AlertCircleIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
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
            disabled={isFetching || loading}
            type="submit"
            className="mt-6 w-full bg-green-100 text-green-800 hover:bg-green-800 hover:text-green-100"
          >
            {loading ? (
              <>
                <Spinner /> Processing...
              </>
            ) : (
              "Pay with M-Pesa"
            )}
          </Button>
        </form>
        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Payment Instructions
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <div className="shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm font-bold">1</span>
              </div>
              <span>Enter your M-Pesa registered phone number</span>
            </li>
            {/* <li className="flex items-start">
              <div className="shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm font-bold">2</span>
              </div>
              <span>Enter the payment amount in Kenyan Shillings</span>
            </li> */}
            <li className="flex items-start">
              <div className="shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm font-bold">3</span>
              </div>
              <span>Click &quot;Pay with M-Pesa&quot; to initiate payment</span>
            </li>
            <li className="flex items-start">
              <div className="shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm font-bold">4</span>
              </div>
              <span>
                Check your phone for the M-Pesa prompt and enter your PIN
              </span>
            </li>
          </ul>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-md">
            <h3 className="font-medium text-yellow-800 mb-2">
              Important Notes
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>
                • Ensure you have sufficient balance in your M-Pesa account
              </li>
              <li>• You&apos;ll receive a confirmation SMS from M-Pesa</li>
              <li>• Payment processing may take a few moments</li>
              <li>• Keep this window open until payment is complete</li>
            </ul>
          </div>
        </div>
        {/* Instructions */}
      </div>
    </div>
  );
};

export default MpesaForm;
