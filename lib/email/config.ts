// Email configuration types
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  fromName: string;
}

// Get email configuration from environment variables
export function getEmailConfig(): EmailConfig {
  return {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASSWORD || "",
    },
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "",
    fromName: process.env.EMAIL_FROM_NAME || "CRM System",
  };
}

// Verify that email configuration is valid
export function isEmailConfigValid(): boolean {
  const config = getEmailConfig();
  return !!(config.auth.user && config.auth.pass);
}
