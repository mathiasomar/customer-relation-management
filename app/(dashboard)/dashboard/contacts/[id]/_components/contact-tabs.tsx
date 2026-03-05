"use client";

import { useState } from "react";
import {
  Mail,
  FileText,
  Calendar,
  MoreHorizontal,
  Phone,
  Video,
  CheckCircle2,
  Clock,
  ActivityIcon,
  Edit,
  Trash2,
  Eye,
  Copy,
} from "lucide-react";
import { format } from "date-fns";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Contact,
  Priority,
  Prisma,
  Task,
  TaskStatus,
} from "@/generated/prisma/browser";
import LogContactActivity from "./log-contact-activity";
import {
  useContactActivities,
  useContactNotes,
  useContactTasks,
} from "@/hooks/use-contact";
import { Spinner } from "@/components/ui/spinner";
import AddNoteForm from "./add-note-form";
import AddTaskForm from "./add-task-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDeleteTask,
  useUpdateTask,
  useUpdateTaskStatus,
} from "@/hooks/use-task";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SendEmailForm from "./email-form";
import { EmailHistory } from "./email-history";

interface ContactTabsProps {
  contact: Contact;
}

interface TaskTypes extends Task {
  assignee?: {
    name: string;
    image?: string | null;
  } | null;
}

const TaskDetailsDialog = ({
  task,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: {
  task: TaskTypes;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, data: Prisma.TaskUpdateInput) => void;
  onDelete: (id: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || TaskStatus.PENDING,
    priority: task?.priority || Priority.MEDIUM,
    dueDate: task?.dueDate || null,
  });

  const handleSave = () => {
    onUpdate(task.id, editedTask);
    setIsEditing(false);
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete(task.id);
    onOpenChange(false);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>View and manage this task</DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedTask.title}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedTask.description || ""}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editedTask.status}
                  onValueChange={(value) =>
                    setEditedTask({
                      ...editedTask,
                      status: value as TaskStatus,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>
                      In Progress
                    </SelectItem>
                    <SelectItem value={TaskStatus.COMPLETED}>
                      Completed
                    </SelectItem>
                    <SelectItem value={TaskStatus.CANCELLED}>
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={editedTask.priority}
                  onValueChange={(value) =>
                    setEditedTask({
                      ...editedTask,
                      priority: value as Priority,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Priority.LOW}>Low</SelectItem>
                    <SelectItem value={Priority.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={Priority.HIGH}>High</SelectItem>
                    <SelectItem value={Priority.URGENT}>Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={
                  editedTask.dueDate
                    ? format(new Date(editedTask.dueDate), "yyyy-MM-dd")
                    : ""
                }
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    dueDate: e.target.value ? new Date(e.target.value) : null,
                  })
                }
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Title
              </h4>
              <p className="text-sm">{task.title}</p>
            </div>
            {task.description && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Description
                </h4>
                <p className="text-sm whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Status
                </h4>
                <Badge
                  variant="outline"
                  className={`
                    ${task.status === TaskStatus.COMPLETED ? "bg-green-100 text-green-700" : ""}
                    ${task.status === TaskStatus.IN_PROGRESS ? "bg-blue-100 text-blue-700" : ""}
                    ${task.status === TaskStatus.PENDING ? "bg-yellow-100 text-yellow-700" : ""}
                    ${task.status === TaskStatus.CANCELLED ? "bg-red-100 text-red-700" : ""}
                  `}
                >
                  {task.status}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Priority
                </h4>
                <Badge
                  variant="outline"
                  className={`
                    ${task.priority === Priority.URGENT ? "bg-red-100 text-red-700" : ""}
                    ${task.priority === Priority.HIGH ? "bg-orange-100 text-orange-700" : ""}
                    ${task.priority === Priority.MEDIUM ? "bg-blue-100 text-blue-700" : ""}
                    ${task.priority === Priority.LOW ? "bg-gray-100 text-gray-700" : ""}
                  `}
                >
                  {task.priority}
                </Badge>
              </div>
            </div>
            {task.dueDate && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Due Date
                </h4>
                <p className="text-sm">
                  {format(new Date(task.dueDate), "MMMM d, yyyy")}
                </p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Assigned To
              </h4>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee?.image || ""} />
                  <AvatarFallback className="text-[10px]">
                    {task.assignee?.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {task.assignee?.name || "Unassigned"}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Created
              </h4>
              <p className="text-sm">
                {format(new Date(task.createdAt), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function ContactTabs({ contact }: ContactTabsProps) {
  const [activeTab, setActiveTab] = useState("activity");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  // const { data: session, isPending } = authClient.useSession();
  // const tenant = isPending ? null : session?.session.tenantId;

  const { data: initialActivities, isFetching: loadingActivities } =
    useContactActivities(contact.id, 10);
  const { data: initialNotes, isFetching: loadingNotes } = useContactNotes(
    contact.id,
    10,
  );
  const { data: initialTasks, isFetching: loadingTasks } = useContactTasks(
    contact.id,
    10,
  );

  const updateTaskStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();

  const handleTaskStatusChange = async (taskId: string, checked: boolean) => {
    try {
      await updateTaskStatus.mutateAsync({
        taskId,
        status: checked ? TaskStatus.COMPLETED : TaskStatus.PENDING,
      });
      toast.success(checked ? "Task completed" : "Task reopened");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update task status",
      );
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handleTaskUpdate = async (
    taskId: string,
    data: { title: string; taskDate: Date },
  ) => {
    try {
      await updateTask.mutateAsync({ taskId, data });
      toast.success("Task updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update task",
      );
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success("Task deleted successfully");
      // refetchTasks();
      setTaskDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete task",
      );
    }
  };

  const handleTaskDuplicate = async (task: Task) => {
    try {
      // Create a copy of the task
      const duplicatedTask = {
        title: `${task.title} (Copy)`,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        contactId: contact.id,
        assigneeId: task.assigneeId,
      };

      // You'll need to add a duplicateTask mutation in your hooks
      // await duplicateTask.mutateAsync(duplicatedTask);

      toast.success("Task duplicated successfully");
      // refetchTasks();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to duplicate task",
      );
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">Contact Activity</CardTitle>
          <CardDescription>
            View and manage all interactions with this contact
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="px-6 pt-2 border-b">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="activity"
                  className="flex items-center gap-2"
                >
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
                              <AvatarImage
                                src={activity.creator?.image || ""}
                              />
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
                                {format(
                                  new Date(note.createdAt),
                                  "MMM d, yyyy",
                                )}
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
                <SendEmailForm contact={contact} />

                {/* Email List */}
                <EmailHistory contactId={contact.id} />
              </div>
            </TabsContent>

            {/* Tasks Tab Content */}
            <TabsContent value="tasks" className="p-6 space-y-4">
              <div className="space-y-4">
                {/* Add Task Form */}
                <AddTaskForm contactId={contact.id} />

                {/* Tasks List */}
                <ScrollArea className="h-[400px] pr-4">
                  {loadingTasks ? (
                    <div className="flex justify-center items-center flex-col gap-4 h-40">
                      <Spinner className="w-15 h-15" />
                      <span className="text-muted-foreground animate-pulse">
                        Loading tasks...
                      </span>
                    </div>
                  ) : initialTasks?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No tasks yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {initialTasks?.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/5 transition-colors cursor-pointer"
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={task.status === TaskStatus.COMPLETED}
                                onCheckedChange={(checked) =>
                                  handleTaskStatusChange(
                                    task.id,
                                    checked as boolean,
                                  )
                                }
                              />
                            </div>
                            <div className="flex-1">
                              <p
                                className={`text-sm font-medium ${
                                  task.status === TaskStatus.COMPLETED
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }`}
                              >
                                {task.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Due{" "}
                                  {task.dueDate
                                    ? format(
                                        new Date(task.dueDate),
                                        "MMM d, yyyy",
                                      )
                                    : "No due date"}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    task.status === TaskStatus.COMPLETED
                                      ? "bg-green-100 text-green-700"
                                      : task.status === TaskStatus.OVERDUE
                                        ? "bg-red-100 text-red-700"
                                        : task.status === TaskStatus.IN_PROGRESS
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {task.status}
                                </Badge>
                                {task.priority && (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      task.priority === Priority.URGENT
                                        ? "bg-red-100 text-red-700"
                                        : task.priority === Priority.HIGH
                                          ? "bg-orange-100 text-orange-700"
                                          : task.priority === Priority.MEDIUM
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {task.priority}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={task.assignee?.image || ""} />
                              <AvatarFallback className="text-[10px]">
                                {task.assignee?.name?.[0] || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                  Task Actions
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleTaskClick(task)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleTaskClick(task)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Task
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleTaskDuplicate(task)}
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleTaskDelete(task.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
      {/* Task Details Dialog */}
      <TaskDetailsDialog
        task={selectedTask as TaskTypes}
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onUpdate={() =>
          handleTaskUpdate(selectedTask!.id, {
            title: selectedTask!.title,
            taskDate: selectedTask!.dueDate!,
          })
        }
        onDelete={handleTaskDelete}
      />
    </>
  );
}
