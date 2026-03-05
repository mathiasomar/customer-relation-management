import nodemailer from "nodemailer";
import { getEmailConfig, isEmailConfigValid, EmailConfig } from "./config";
import { EmailTemplate } from "./template";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
}

export interface EmailDetails {
  messageId: string;
  envelope?: {
    from?: string;
    to?: string[];
  };
  accepted?: string[];
  rejected?: string[];
  pending?: string[];
  response?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: EmailDetails;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;

  constructor() {
    this.config = getEmailConfig();
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (!isEmailConfigValid()) {
      console.warn(
        "Email configuration is not valid. Email sending will be disabled.",
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.auth.user,
        pass: this.config.auth.pass,
      },
      tls: {
        rejectUnauthorized: false, // Only for development
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      if (!this.transporter) {
        throw new Error(
          "Email transporter not initialized. Check your email configuration.",
        );
      }

      const mailOptions = {
        from: `"${this.config.fromName}" <${this.config.from}>`,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        // cc: options.cc
        //   ? Array.isArray(options.cc)
        //     ? options.cc.join(", ")
        //     : options.cc
        //   : undefined,
        // bcc: options.bcc
        //   ? Array.isArray(options.bcc)
        //     ? options.bcc.join(", ")
        //     : options.bcc
        //   : undefined,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
        details: {
          messageId: info.messageId,
          envelope: info.envelope,
          accepted: info.accepted,
          rejected: info.rejected,
          pending: info.pending,
          response: info.response,
        },
      };
    } catch (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      };
    }
  }

  async sendTemplateEmail(
    to: string | string[],
    template: EmailTemplate,
    attachments?: EmailOptions["attachments"],
  ): Promise<EmailResult> {
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      attachments,
    });
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        return false;
      }
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("Email connection verification failed:", error);
      return false;
    }
  }
}

// Export a singleton instance
export const emailService = new EmailService();
