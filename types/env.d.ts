declare namespace NodeJS {
  interface ProcessEnv {
    MPESA_CONSUMER_KEY: string;
    MPESA_CONSUMER_SECRET: string;
    MPESA_SHORTCODE: string;
    MPESA_PASSKEY: string;
    MPESA_CALLBACK_URL: string;
    MPESA_ENVIRONMENT: "sandbox" | "production";
  }
}
