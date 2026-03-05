import {
  getEmailHistory,
  SendEmailInput,
  sendEmailToContact,
  sendTemplateEmail,
} from "@/actions/email-action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hook for sending email to contact
export const useSendEmail = (contactId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendEmailInput) => sendEmailToContact(contactId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-history", contactId] });
      queryClient.invalidateQueries({
        queryKey: ["contact-activities", contactId],
      });
    },
  });
};

// Hook for sending template email
export const useSendTemplateEmail = (contactId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateName,
      customData,
    }: {
      templateName: "welcome" | "followUp" | "thankYou";
      customData?: Record<string, any>;
    }) => sendTemplateEmail(contactId, templateName, customData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-history", contactId] });
      queryClient.invalidateQueries({
        queryKey: ["contact-activities", contactId],
      });
    },
  });
};

// Hook for getting email history
export const useEmailHistory = (contactId: string) => {
  return useQuery({
    queryKey: ["email-history", contactId],
    queryFn: () => getEmailHistory(contactId),
    enabled: !!contactId,
  });
};
