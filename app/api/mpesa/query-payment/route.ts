import { mpesaService } from "@/types/mpesa.service";
import { STKPushQueryRequest } from "@/types/mpesa.types";
import { ApiResponse } from "@/types/mpesa.types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const body: STKPushQueryRequest = await request.json();
    const { checkoutRequestID } = body;

    if (!checkoutRequestID) {
      return NextResponse.json(
        { success: false, error: "Checkout Request ID is required" },
        { status: 400 },
      );
    }

    const result = await mpesaService.querySTKPush({ checkoutRequestID });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Query payment error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to query payment status";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
