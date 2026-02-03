import { mpesaService } from "@/types/mpesa.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing M-Pesa authentication...");

    // Test the getAccessToken method
    const accessToken = await mpesaService["getAccessToken"]();

    console.log("✅ Authentication successful!");
    console.log("Access token:", accessToken.substring(0, 20) + "...");

    return NextResponse.json({
      success: true,
      message: "M-Pesa authentication successful",
      accessToken: accessToken.substring(0, 20) + "...",
    });
  } catch (error) {
    console.error("❌ Authentication failed:");
    console.error("Error:", error instanceof Error ? error.message : error);

    return NextResponse.json(
      {
        success: false,
        message: "M-Pesa authentication failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
