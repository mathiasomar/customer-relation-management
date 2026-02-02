import { mpesaService } from "@/types/mpesa.service";
import { STKPushRequest } from "@/types/mpesa.types";
import { ApiResponse } from "@/types/mpesa.types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const body: STKPushRequest = await request.json();
    const { phoneNumber, amount } = body;

    // Validate input
    if (!phoneNumber || !amount) {
      return NextResponse.json(
        { success: false, error: "Phone number and amount are required" },
        { status: 400 },
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be greater than 0" },
        { status: 400 },
      );
    }

    // Initiate STK Push
    const response = await mpesaService.initiateSTKPush(body);

    return NextResponse.json({
      success: true,
      data: response,
      message: "STK Push initiated successfully",
    });
  } catch (error) {
    console.error("STK Push API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to initiate payment";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
