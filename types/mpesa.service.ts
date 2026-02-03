import axios, { AxiosError } from "axios";

import {
  STKPushRequest,
  STKPushResponse,
  STKPushQueryRequest,
  STKPushQueryResponse,
  MpesaConfig,
} from "@/types/mpesa.types";

class MpesaService {
  private config: MpesaConfig;
  private baseURL: string;

  constructor() {
    this.config = {
      consumerKey: process.env.MPESA_CONSUMER_KEY!,
      consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
      shortCode: process.env.MPESA_SHORTCODE!,
      passKey: process.env.MPESA_PASSKEY!,
      callbackURL: process.env.MPESA_CALLBACK_URL!,
      environment: process.env.MPESA_ENVIRONMENT as "sandbox" | "production",
    };

    this.baseURL =
      this.config.environment === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

    this.validateConfig();
  }

  private validateConfig(): void {
    const requiredFields: (keyof MpesaConfig)[] = [
      "consumerKey",
      "consumerSecret",
      "shortCode",
      "passKey",
      "callbackURL",
      "environment",
    ];

    requiredFields.forEach((field) => {
      if (!this.config[field]) {
        throw new Error(`M-Pesa ${field} is not configured`);
      }
    });
  }

  private async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(
        `${this.config.consumerKey}:${this.config.consumerSecret}`,
      ).toString("base64");

      const response = await axios.get<{
        access_token: string;
        expires_in: string;
      }>(`${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      return response.data.access_token;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        "Error getting access token:",
        axiosError.response?.data || axiosError.message,
      );
      throw new Error("Failed to get access token");
    }
  }

  private generateTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private generatePassword(timestamp: string): string {
    const data = this.config.shortCode + this.config.passKey + timestamp;
    return Buffer.from(data).toString("base64");
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, "");

    // If starts with 0, convert to 254
    if (cleaned.startsWith("0")) {
      return `254${cleaned.substring(1)}`;
    }

    // If starts with 254, return as is
    if (cleaned.startsWith("254")) {
      return cleaned;
    }

    // If starts with country code but not 254, or no country code
    // Assuming Kenyan number, prepend 254
    const last9Digits = cleaned.slice(-9);
    return `254${last9Digits}`;
  }

  public async initiateSTKPush(
    request: STKPushRequest,
  ): Promise<STKPushResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);
      const formattedPhone = this.formatPhoneNumber(request.phoneNumber);

      const payload = {
        BusinessShortCode: this.config.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline" as const,
        Amount: request.amount,
        PartyA: formattedPhone,
        PartyB: this.config.shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.config.callbackURL,
        AccountReference: request.accountReference || "Payment",
        TransactionDesc: request.transactionDesc || "Payment for services",
      };

      const response = await axios.post<STKPushResponse>(
        `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        "Error initiating STK Push:",
        axiosError.response?.data || axiosError.message,
      );
      throw new Error("Failed to initiate STK Push");
    }
  }

  public async querySTKPush(
    request: STKPushQueryRequest,
  ): Promise<STKPushQueryResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const payload = {
        BusinessShortCode: this.config.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: request.checkoutRequestID,
      };

      const response = await axios.post<STKPushQueryResponse>(
        `${this.baseURL}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        "Error querying STK Push:",
        axiosError.response?.data || axiosError.message,
      );
      throw new Error("Failed to query STK Push");
    }
  }
}

export const mpesaService = new MpesaService();
