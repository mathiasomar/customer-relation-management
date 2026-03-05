"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  MoreHorizontal,
  Paperclip,
  Send,
  Smile,
  Link2,
  File,
  X,
  Loader2,
  ImageIcon,
} from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Resolver } from "react-hook-form";
import { toast } from "sonner";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Contact } from "@/generated/prisma/client";
import { useSendEmail, useSendTemplateEmail } from "@/hooks/use-email";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Image from "next/image";

// Simple emoji picker component
const EmojiPicker = ({
  onEmojiSelect,
}: {
  onEmojiSelect: (emoji: string) => void;
}) => {
  const emojis = [
    "😊",
    "👍",
    "❤️",
    "😂",
    "🎉",
    "🤔",
    "👋",
    "📧",
    "📞",
    "✅",
    "⭐",
    "🔥",
  ];

  return (
    <div className="grid grid-cols-6 gap-1 p-2">
      {emojis.map((emoji) => (
        <Button
          key={emoji}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEmojiSelect(emoji)}
          type="button"
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
};

// Attachment type
interface Attachment {
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  content?: Buffer | string;
}

const formSchema = z.object({
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  body: z.string().min(2, "Email body must be at least 2 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const SendEmailForm = ({
  contact,
  sentSuccess,
}: {
  contact: Contact;
  sentSuccess?: () => void;
}) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    "welcome" | "followUp" | "thankYou" | null
  >(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendEmailMutation = useSendEmail(contact.id);
  const sendTemplateMutation = useSendTemplateEmail(contact.id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      subject: "",
      body: "",
    },
  });

  // Convert file to buffer for sending
  const fileToBuffer = (file: File): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const buffer = Buffer.from(reader.result as ArrayBuffer);
        resolve(buffer);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!contact.email) {
      toast.error("Contact does not have an email address");
      return;
    }

    setIsProcessing(true);

    try {
      // Process attachments for email service
      const processedAttachments = await Promise.all(
        attachments.map(async (att) => {
          const content = await fileToBuffer(att.file);
          return {
            filename: att.name,
            content: content.toString("base64"),
            contentType: att.type,
          };
        }),
      );

      // Send email with attachments
      sendEmailMutation.mutateAsync(
        {
          subject: data.subject,
          body: data.body,
          attachments: processedAttachments,
        },
        {
          onSuccess: () => {
            toast.success("Email sent successfully!");
            form.reset();
            setAttachments([]);
            sentSuccess?.();
          },
          onError: (error) => {
            console.error("Email sending error:", error);
            toast.error("Failed to send Email. Please try again.");
            if (error instanceof Error) {
              toast.error(error.message);
            }
          },
          onSettled: () => {
            setIsProcessing(false);
          },
        },
      );
    } catch (error) {
      console.error("Error processing attachments:", error);
      toast.error("Failed to process attachments");
      setIsProcessing(false);
    }
  };

  // Handle template email sending
  const handleTemplateSend = () => {
    if (!selectedTemplate) return;

    setIsProcessing(true);

    sendTemplateMutation.mutateAsync(
      {
        templateName: selectedTemplate,
        customData: {
          // You can add custom data here if needed
          // For example: product name, meeting time, etc.
        },
      },
      {
        onSuccess: () => {
          toast.success(
            `${selectedTemplate} template email sent successfully!`,
          );
          setShowTemplateConfirm(false);
          setSelectedTemplate(null);
          sentSuccess?.();
        },
        onError: (error) => {
          console.error("Template email error:", error);
          toast.error("Failed to send template email");
        },
        onSettled: () => {
          setIsProcessing(false);
        },
      },
    );
  };

  // Just fill the form with template content (don't send)
  const fillTemplateInForm = (
    type: "followUp" | "introduction" | "thankYou",
  ) => {
    const templates = {
      followUp: {
        subject: `Following up with you, ${contact.firstName}`,
        body: `Hi ${contact.firstName},\n\nI wanted to follow up on our recent conversation. Let me know if you have any questions.\n\nBest regards,\n[Your name]`,
      },
      introduction: {
        subject: `Great to connect, ${contact.firstName}!`,
        body: `Hi ${contact.firstName},\n\nIt was great connecting with you. I'd love to learn more about your work and see how we can help.\n\nBest regards,\n[Your name]`,
      },
      thankYou: {
        subject: `Thank you, ${contact.firstName}!`,
        body: `Hi ${contact.firstName},\n\nThank you for your time and interest. I look forward to working with you.\n\nBest regards,\n[Your name]`,
      },
    };

    const template = templates[type];
    form.setValue("subject", template.subject);
    form.setValue("body", template.body);
    toast.success("Template loaded! You can edit it before sending.");
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    toast.loading("Processing files...", { id: "file-processing" });

    const newAttachments: Attachment[] = [];

    for (const file of Array.from(files)) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        continue;
      }

      const attachment: Attachment = {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      };

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          attachment.preview = e.target?.result as string;
          // Force re-render to show preview
          setAttachments((prev) => [...prev]);
        };
        reader.readAsDataURL(file);
      }

      newAttachments.push(attachment);
    }

    setAttachments((prev) => [...prev, ...newAttachments]);

    toast.dismiss("file-processing");
    toast.success(`${newAttachments.length} file(s) added`);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Insert link into body
  const insertLink = () => {
    if (!linkUrl || !linkText) {
      toast.error("Please enter both link text and URL");
      return;
    }

    // Validate URL
    try {
      new URL(linkUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    const currentBody = form.getValues("body");
    const linkHtml = `<a href="${linkUrl}" target="_blank">${linkText}</a>`;
    const newBody = currentBody + (currentBody ? "\n\n" : "") + linkHtml;

    form.setValue("body", newBody);
    setLinkDialogOpen(false);
    setLinkUrl("");
    setLinkText("");
    toast.success("Link added to email body");
  };

  // Insert emoji into body
  const insertEmoji = (emoji: string) => {
    const currentBody = form.getValues("body");
    const newBody = currentBody + emoji;
    form.setValue("body", newBody);
    setEmojiPickerOpen(false);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const isSending =
    sendEmailMutation.isPending ||
    sendTemplateMutation.isPending ||
    isProcessing;

  if (!contact.email) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Compose Email</CardTitle>
          <CardDescription>
            No email address available for this contact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please add an email address to the contact to send emails.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Compose Email</CardTitle>
          <CardDescription>Send an email to {contact.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="send-email-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="subject"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Input
                      {...field}
                      id="subject"
                      placeholder="Email subject"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="body"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Textarea
                      ref={textareaRef}
                      placeholder="Write your message here..."
                      value={field.value}
                      onChange={field.onChange}
                      className="min-h-[150px]"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Attachments:
              </p>
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-muted/50 rounded-md p-2 pr-1 text-sm"
                  >
                    {attachment.preview ? (
                      <Image
                        src={attachment.preview}
                        alt={attachment.name}
                        className="h-8 w-8 object-cover rounded"
                        width={32}
                        height={32}
                      />
                    ) : (
                      <File className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="max-w-[150px]">
                      <p className="text-xs truncate">{attachment.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-1"
                      onClick={() => removeAttachment(index)}
                      type="button"
                      disabled={isSending}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            />

            {/* Paperclip Button - File Upload */}
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
              disabled={isSending}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Smile Button - Emoji Picker */}
            <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  title="Insert emoji"
                  disabled={isSending}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <EmojiPicker onEmojiSelect={insertEmoji} />
              </PopoverContent>
            </Popover>

            {/* More Button - Additional Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  title="More options"
                  disabled={isSending}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>More Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLinkDialogOpen(true)}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Insert Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Insert Image
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <File className="mr-2 h-4 w-4" />
                  Save as Draft
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            size="sm"
            disabled={!form.formState.isValid || isSending}
            type="submit"
            form="send-email-form"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isProcessing ? "Processing..." : "Sending..."}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Add a link to your email. The link will be inserted at the end of
              your message.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link-text">Link Text</Label>
              <Input
                id="link-text"
                placeholder="Click here"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={insertLink}>Insert Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Confirmation Dialog */}
      <Dialog open={showTemplateConfirm} onOpenChange={setShowTemplateConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Template Email</DialogTitle>
            <DialogDescription>
              This will send a pre-formatted {selectedTemplate} email to{" "}
              {contact.firstName}. The email will use our standard template.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to send this template email?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTemplateConfirm(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleTemplateSend} disabled={isSending}>
              {isSending ? "Sending..." : "Send Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Templates */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Use a template:</span>

        {/* Fill Form Templates */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" className="h-auto p-0 text-xs" type="button">
              Fill Form
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => fillTemplateInForm("followUp")}>
              Follow-up
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => fillTemplateInForm("introduction")}
            >
              Introduction
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fillTemplateInForm("thankYou")}>
              Thank You
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="text-xs">|</span>

        {/* Send Direct Templates */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" className="h-auto p-0 text-xs" type="button">
              Send Direct
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                setSelectedTemplate("followUp");
                setShowTemplateConfirm(true);
              }}
            >
              Follow-up
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedTemplate("welcome");
                setShowTemplateConfirm(true);
              }}
            >
              Welcome
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedTemplate("thankYou");
                setShowTemplateConfirm(true);
              }}
            >
              Thank You
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export default SendEmailForm;
