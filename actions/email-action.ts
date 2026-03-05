"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  getCurrentUser,
  verifyTenantPermission,
} from "@/lib/permisions/tenant";
import { emailService } from "@/lib/email/service";
import { ActivityType, ActivityStatus } from "@/generated/prisma/enums";
import { emailTemplates } from "@/lib/email/template";

// Schema for sending email
const sendEmailSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Email body is required"),
  //   cc: z
  //     .string()
  //     .regex(
  //       /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  //       "Invalid CC email",
  //     )
  //     .optional(),
  //   bcc: z.string().email("Invalid BCC email").optional(),
  template: z.enum(["welcome", "followUp", "thankYou", "custom"]).optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        content: z.string(),
        contentType: z.string(),
      }),
    )
    .optional(),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;

export async function sendEmailToContact(
  contactId: string,
  data: SendEmailInput,
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const { tenantId } = await verifyTenantPermission();

    // Validate input
    const validatedData = sendEmailSchema.parse(data);

    // Get contact details
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!contact) {
      return { success: false, error: "Contact not found" };
    }

    if (!contact.email) {
      return {
        success: false,
        error: "Contact does not have an email address",
      };
    }

    // Send the email
    const emailResult = await emailService.sendEmail({
      to: contact.email,
      subject: validatedData.subject,
      html: validatedData.body.replace(/\n/g, "<br>"),
      text: validatedData.body,
      attachments: validatedData.attachments?.map(att => ({
        filename: att.filename,
        content: Buffer.from(att.content, 'base64'),
        contentType: att.contentType,
      })),
      //   cc: validatedData.cc,
      //   bcc: validatedData.bcc,
    });

    if (!emailResult.success) {
      return { success: false, error: emailResult.error };
    }

    // Log the activity
    const activity = await prisma.activity.create({
      data: {
        type: ActivityType.EMAIL,
        title: `Email: ${validatedData.subject}`,
        description:
          validatedData.body.substring(0, 200) +
          (validatedData.body.length > 200 ? "..." : "") +
          (validatedData.attachments && validatedData.attachments.length > 0
            ? ` (with ${validatedData.attachments.length} attachment${validatedData.attachments.length > 1 ? 's' : ''})`
            : ""),
        status: ActivityStatus.COMPLETED,
        tenantId: tenantId ?? "",
        creatorId: session.id,
        contactId,
        emailData: {
          to: contact.email,
          subject: validatedData.subject,
          messageId: emailResult.messageId,
          attachments: validatedData.attachments?.map(att => att.filename),
          //   cc: validatedData.cc,
          //   bcc: validatedData.bcc,
        },
      },
    });

    // Update contact's lastActivityAt
    await prisma.contact.update({
      where: { id: contactId },
      data: { lastActivityAt: new Date(), lastContactedAt: new Date() },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "SEND_EMAIL",
        entityType: "Contact",
        entityId: contactId,
        tenantId: tenantId ?? "",
        userId: session.id,
        changes: { emailSubject: validatedData.subject },
      },
    });

    revalidatePath(`/dashboard/contacts/${contactId}`);

    return {
      success: true,
      activity,
      message: "Email sent successfully!",
      messageId: emailResult.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

export async function sendTemplateEmail(
  contactId: string,
  templateName: "welcome" | "followUp" | "thankYou",
  customData?: Record<string, any>,
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const { tenantId } = await verifyTenantPermission();

    // Get contact details
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!contact) {
      return { success: false, error: "Contact not found" };
    }

    if (!contact.email) {
      return {
        success: false,
        error: "Contact does not have an email address",
      };
    }

    // Get the template
    const template = emailTemplates[templateName]({
      name: `${contact.firstName} ${contact.lastName}`,
      company: contact.company || undefined,
      ...customData,
    });

    // Send the email
    const emailResult = await emailService.sendTemplateEmail(
      contact.email,
      template,
    );

    if (!emailResult.success) {
      return { success: false, error: emailResult.error };
    }

    // Log the activity
    const activity = await prisma.activity.create({
      data: {
        type: ActivityType.EMAIL,
        title: `Email: ${template.subject}`,
        description: `Sent ${templateName} template email`,
        status: ActivityStatus.COMPLETED,
        tenantId: tenantId ?? "",
        creatorId: session.id,
        contactId,
        emailData: {
          to: contact.email,
          subject: template.subject,
          template: templateName,
          messageId: emailResult.messageId,
        },
      },
    });

    // Update contact's lastActivityAt
    await prisma.contact.update({
      where: { id: contactId },
      data: { lastActivityAt: new Date() },
    });

    revalidatePath(`/dashboard/contacts/${contactId}`);

    return {
      success: true,
      activity,
      message: "Template email sent successfully!",
    };
  } catch (error) {
    console.error("Error sending template email:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send template email",
    };
  }
}

export async function getEmailHistory(contactId: string) {
  try {
    const { tenantId } = await verifyTenantPermission();

    const emails = await prisma.activity.findMany({
      where: {
        contactId,
        tenantId,
        type: ActivityType.EMAIL,
        deletedAt: null,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return { success: true, emails };
  } catch (error) {
    console.error("Error fetching email history:", error);
    return { success: false, error: "Failed to fetch email history" };
  }
}
