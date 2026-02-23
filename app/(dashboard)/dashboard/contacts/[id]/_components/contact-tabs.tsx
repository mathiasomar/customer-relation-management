"use client";

import { useState } from "react";
import {
  Mail,
  FileText,
  Calendar,
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  Phone,
  Video,
  CheckCircle2,
  Clock,
  ActivityIcon,
} from "lucide-react";
import { format } from "date-fns";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
// import { authClient } from "@/lib/auth-client";
import { ContactTask } from "@/types/contact";
import { Contact } from "@/generated/prisma/client";
import LogContactActivity from "./log-contact-activity";
import { useContactActivities, useContactNotes } from "@/hooks/use-contact";
import { Spinner } from "@/components/ui/spinner";
import AddNoteForm from "./add-note-form";

interface ContactTabsProps {
  contact: Contact;
  initialTasks: ContactTask[];
}

export function ContactTabs({ contact, initialTasks }: ContactTabsProps) {
  const [activeTab, setActiveTab] = useState("activity");
  const [newEmail, setNewEmail] = useState({ subject: "", body: "" });
  const [newTask, setNewTask] = useState({ title: "", dueDate: "" });

  // const { data: session, isPending } = authClient.useSession();
  // const tenant = isPending ? null : session?.session.tenantId;

  const { data: initialActivities, isFetching: loadingActivities } =
    useContactActivities(contact.id, 10);
  const { data: initialNotes, isFetching: loadingNotes } = useContactNotes(
    contact.id,
    10,
  );

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">Contact Activity</CardTitle>
        <CardDescription>
          View and manage all interactions with this contact
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-2 border-b">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <ActivityIcon className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Tasks
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Activity Tab Content */}
          <TabsContent value="activity" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <LogContactActivity
                contactId={contact.id}
                contactName={`${contact.firstName} ${contact.lastName}`}
              />
            </div>

            <ScrollArea className="h-100 pr-4">
              {loadingActivities ? (
                <div className="flex justify-center items-center flex-col gap-4 h-40">
                  <Spinner className="w-15 h-15" />
                  <span className="text-muted-foreground animate-pulse">
                    Loading activities...
                  </span>
                </div>
              ) : initialActivities?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ActivityIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No activities yet</p>
                  <LogContactActivity
                    btnType="link"
                    contactId={contact.id}
                    contactName={`${contact.firstName} ${contact.lastName}`}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {initialActivities?.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="shrink-0">
                        {activity.type === "CALL" && (
                          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Phone className="h-5 w-5" />
                          </div>
                        )}
                        {activity.type === "EMAIL" && (
                          <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <Mail className="h-5 w-5" />
                          </div>
                        )}
                        {activity.type === "MEETING" && (
                          <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Video className="h-5 w-5" />
                          </div>
                        )}
                        {activity.type === "FOLLOW_UP" && (
                          <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center">
                            <Clock className="h-5 w-5" />
                          </div>
                        )}
                        {activity.type === "TASK" && (
                          <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{activity.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {format(
                              new Date(activity.createdAt),
                              "MMM d, h:mm a",
                            )}
                          </span>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={activity.creator?.image || ""} />
                            <AvatarFallback className="text-[10px]">
                              {activity.creator?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            by {activity.creator?.name}
                          </span>
                          {activity.status && (
                            <Badge variant="outline" className="text-xs">
                              {activity.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Notes Tab Content */}
          <TabsContent value="notes" className="p-6 space-y-4">
            <div className="space-y-4">
              {/* Add Note Form */}
              <AddNoteForm contactId={contact.id} />

              {/* Notes List */}
              <ScrollArea className="h-75 pr-4">
                {loadingNotes ? (
                  <div className="flex justify-center items-center flex-col gap-4 h-40">
                    <Spinner className="w-15 h-15" />
                    <span className="text-muted-foreground animate-pulse">
                      Loading notes...
                    </span>
                  </div>
                ) : initialNotes?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No notes yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {initialNotes?.map((note) => (
                      <Card key={note.id}>
                        <CardContent className="p-4">
                          <p className="text-sm whitespace-pre-wrap">
                            {note.content}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={note.author?.image || ""} />
                                <AvatarFallback className="text-[10px]">
                                  {note.author?.name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {note.author?.name}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(note.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Email Tab Content */}
          <TabsContent value="email" className="p-6 space-y-4">
            <div className="space-y-4">
              {/* Compose Email */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Compose Email</CardTitle>
                  <CardDescription>
                    Send an email to this contact
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Subject"
                    value={newEmail.subject}
                    onChange={(e) =>
                      setNewEmail({ ...newEmail, subject: e.target.value })
                    }
                  />
                  <Textarea
                    placeholder="Write your message..."
                    value={newEmail.body}
                    onChange={(e) =>
                      setNewEmail({ ...newEmail, body: e.target.value })
                    }
                    className="min-h-37.5"
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button disabled={!newEmail.subject || !newEmail.body}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                </CardFooter>
              </Card>

              {/* Email Templates */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Use a template:</span>
                <Button variant="link" className="h-auto p-0 text-xs">
                  Follow-up
                </Button>
                <Button variant="link" className="h-auto p-0 text-xs">
                  Introduction
                </Button>
                <Button variant="link" className="h-auto p-0 text-xs">
                  Thank you
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Tasks Tab Content */}
          <TabsContent value="tasks" className="p-6 space-y-4">
            <div className="space-y-4">
              {/* Add Task Form */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Create Task</CardTitle>
                  <CardDescription>
                    Create a new task for this contact
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                  />
                  <Input
                    type="date"
                    placeholder="Due date"
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask({ ...newTask, dueDate: e.target.value })
                    }
                  />
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button size="sm" disabled={!newTask.title}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Create Task
                  </Button>
                </CardFooter>
              </Card>

              {/* Tasks List */}
              <ScrollArea className="h-62.5 pr-4">
                {initialTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No tasks yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {initialTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox />
                          <div>
                            <p className="text-sm font-medium">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Due{" "}
                                {task.dueDate
                                  ? format(
                                      new Date(task.dueDate),
                                      "MMM d, yyyy",
                                    )
                                  : ""}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  task.status === "COMPLETED"
                                    ? "bg-green-100 text-green-700"
                                    : task.status === "OVERDUE"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee?.image || ""} />
                            <AvatarFallback className="text-[10px]">
                              {task.assignee?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
