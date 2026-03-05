"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Mail, ChevronDown, ChevronUp, Clock } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmailHistory } from "@/hooks/use-email";

interface EmailHistoryProps {
  contactId: string;
}

export function EmailHistory({ contactId }: EmailHistoryProps) {
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const { data, isLoading } = useEmailHistory(contactId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email History</CardTitle>
          <CardDescription>
            Previous emails sent to this contact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const emails = data?.success ? data.emails : [];

  if (emails?.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email History</CardTitle>
          <CardDescription>
            Previous emails sent to this contact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No emails sent yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email History</CardTitle>
        <CardDescription>Previous emails sent to this contact</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {emails?.map((email) => (
              <div
                key={email.id}
                className="border rounded-lg p-4 hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{email.title}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            setExpandedEmail(
                              expandedEmail === email.id ? null : email.id,
                            )
                          }
                        >
                          {expandedEmail === email.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={email.creator?.image || ""} />
                          <AvatarFallback className="text-[8px]">
                            {email.creator?.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {email.creator?.name}
                        </span>
                        <Clock className="h-3 w-3 text-muted-foreground ml-2" />
                        <span className="text-xs text-muted-foreground">
                          {format(
                            new Date(email.createdAt),
                            "MMM d, yyyy h:mm a",
                          )}
                        </span>
                      </div>

                      {/* {email.emailData && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <div>To: {email.emailData.to}</div>
                          {email.emailData.cc && (
                            <div>CC: {email.emailData.cc}</div>
                          )}
                          {email.emailData.bcc && (
                            <div>BCC: {email.emailData.bcc}</div>
                          )}
                          {email.emailData.template && (
                            <Badge variant="outline" className="mt-1">
                              Template: {email.emailData.template}
                            </Badge>
                          )}
                        </div>
                      )} */}

                      {expandedEmail === email.id && email.description && (
                        <div className="mt-3 p-3 bg-muted/30 rounded text-sm">
                          {email.description}
                          {/* {email.emailData?.messageId && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Message ID: {email.emailData.messageId}
                            </div>
                          )} */}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
