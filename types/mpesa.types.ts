export interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  passKey: string;
  callbackURL: string;
  environment: "sandbox" | "production";
}

export interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference?: string;
  transactionDesc?: string;
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface STKPushQueryRequest {
  checkoutRequestID: string;
}

export interface STKPushQueryResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: string;
  ResultDesc: string;
}

export interface STKPushCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

export interface PaymentResult {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  Amount?: number;
  MpesaReceiptNumber?: string;
  TransactionDate?: string;
  PhoneNumber?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
