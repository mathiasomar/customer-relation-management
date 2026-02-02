import { NextRequest, NextResponse } from "next/server";
import { STKPushCallback, PaymentResult } from "@/types/mpesa.types";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: STKPushCallback = await request.json();

    const { stkCallback } = body.Body;
    const {
      CheckoutRequestID,
      MerchantRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    const paymentResult: PaymentResult = {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
    };

    // Extract metadata if payment was successful
    if (ResultCode === 0 && CallbackMetadata) {
      CallbackMetadata.Item.forEach((item) => {
        switch (item.Name) {
          case "Amount":
            paymentResult.Amount = Number(item.Value);
            break;
          case "MpesaReceiptNumber":
            paymentResult.MpesaReceiptNumber = String(item.Value);
            break;
          case "TransactionDate":
            paymentResult.TransactionDate = String(item.Value);
            break;
          case "PhoneNumber":
            paymentResult.PhoneNumber = String(item.Value);
            break;
        }
      });

      // Handle successful payment
      await handleSuccessfulPayment(paymentResult);

      console.log("✅ Payment successful:", {
        receipt: paymentResult.MpesaReceiptNumber,
        amount: paymentResult.Amount,
        phone: paymentResult.PhoneNumber,
      });
    } else {
      // Handle failed payment
      await handleFailedPayment(paymentResult);

      console.log("❌ Payment failed:", ResultDesc);
    }

    // Always return success to M-Pesa
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    });
  } catch (error) {
    console.error("Callback handler error:", error);

    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: "Failed to process callback",
    });
  }
}

async function handleSuccessfulPayment(payment: PaymentResult): Promise<void> {
  // Implement your business logic here:
  // 1. Update database with payment confirmation
  // 2. Send confirmation email/SMS
  // 3. Fulfill the order/service
  // 4. Update inventory if applicable

  console.log("Processing successful payment:", payment);

  // Example: Update your database
  // await db.payments.create({
  //   data: {
  //     mpesaReceiptNumber: payment.MpesaReceiptNumber!,
  //     amount: payment.Amount!,
  //     phoneNumber: payment.PhoneNumber!,
  //     transactionDate: payment.TransactionDate!,
  //     status: 'completed'
  //   }
  // });
}

async function handleFailedPayment(payment: PaymentResult): Promise<void> {
  // Handle failed payment logic
  // Example: Log failure, send notification to admin, etc.

  console.log("Processing failed payment:", payment);
}
