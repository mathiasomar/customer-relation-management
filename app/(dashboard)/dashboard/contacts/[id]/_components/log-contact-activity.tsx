"use client";

import { useTenantMembers } from "@/hooks/use-tenant";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
  useWatch,
} from "react-hook-form";
import { Resolver } from "react-hook-form";
import * as z from "zod";
import {
  ActivityIcon,
  Calendar,
  CalendarIcon,
  CheckCircle2,
  Clock,
  FileText,
  LinkIcon,
  Mail,
  MapPin,
  Phone,
  Star,
  Video,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../../components/ui/dialog";
import { Button } from "../../../../../../components/ui/button";
import { Spinner } from "../../../../../../components/ui/spinner";
import CalendarComponent from "../../../../../../components/dashboard/calendar-component";
import { useLogContactActivity } from "@/hooks/use-activity";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../../../../../../components/ui/field";
import { Separator } from "../../../../../../components/ui/separator";
import { Input } from "../../../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../components/ui/select";
import { FormControl } from "../../../../../../components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../../components/ui/popover";
import { format } from "date-fns";
import { Checkbox } from "../../../../../../components/ui/checkbox";
import { Textarea } from "../../../../../../components/ui/textarea";
import { Label } from "../../../../../../components/ui/label";
import { Switch } from "../../../../../../components/ui/switch";
import { toast } from "sonner";
import { Priority } from "@/generated/prisma/enums";

interface ActivityLogDialogProps {
  contactId: string;
  contactName: string;
  btnType?: string;
}

const activityTypes = [
  {
    value: "CALL",
    label: "Call",
    icon: Phone,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  {
    value: "EMAIL",
    label: "Email",
    icon: Mail,
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  {
    value: "MEETING",
    label: "Meeting",
    icon: Video,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
  },
  {
    value: "TASK",
    label: "Task",
    icon: CheckCircle2,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
  },
  {
    value: "NOTE",
    label: "Note",
    icon: FileText,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
  },
  {
    value: "DEMO",
    label: "Demo",
    icon: Star,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
  },
  {
    value: "FOLLOW_UP",
    label: "Follow Up",
    icon: Clock,
    color: "text-indigo-500",
    bgColor: "bg-indigo-100",
  },
] as const;

const priorityOptions = [
  { value: "LOW", label: "Low", color: "text-gray-500" },
  { value: "MEDIUM", label: "Medium", color: "text-blue-500" },
  { value: "HIGH", label: "High", color: "text-orange-500" },
  { value: "URGENT", label: "Urgent", color: "text-red-500" },
];

const formSchema = z.object({
  type: z.enum(activityTypes.map((t) => t.value)),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  priority: z.enum(priorityOptions.map((p) => p.value)).default("MEDIUM"),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  meetingUrl: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "Invalid URL",
    }),
  notes: z.string().optional(),
  outcome: z.string().optional(),
  assigneeId: z.string().optional(),
  duration: z.number().optional(),
  reminderAt: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const LogContactActivity = ({
  contactId,
  contactName,
  btnType,
}: ActivityLogDialogProps) => {
  const [open, setOpen] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  const { data: members, isFetching: loadingTenantMembers } =
    useTenantMembers();
  const logActivityMutation = useLogContactActivity();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      type: "CALL",
      title: "",
      description: "",
      priority: "MEDIUM",
      allDay: false,
      location: "",
      meetingUrl: undefined,
      notes: "",
      outcome: "",
      assigneeId: undefined,
      duration: 1,
      reminderAt: undefined,
    },
  });

  const watchType = useWatch({ control: form.control, name: "type" });

  const getSelectedTypeIcon = () => {
    const type = activityTypes.find((t) => t.value === watchType);
    const Icon = type?.icon || Calendar;
    return <Icon className="h-5 w-5" />;
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await logActivityMutation.mutateAsync(
        { contactId, data: { ...data, priority: data.priority as Priority } },
        {
          onSuccess: () => {
            toast.success("Activity logged successfully!");
            setOpen(false);
            form.reset();
          },
          onError: (error) => {
            console.error("Activity logging error:", error);
            toast.error("Failed to log activity. Please try again.");
            if (error instanceof Error) {
              toast.error(error.message);
            }
          },
        },
      );
      console.log(data);
    } catch (error) {
      toast.error(error as string);
    }
    console.log(data);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={btnType === "link" ? "link" : "outline"} size="sm">
          {btnType !== "link" && <ActivityIcon className="mr-2 h-4 w-4" />}
          {btnType === "link" ? "Log your first activity" : "Log Activity"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {getSelectedTypeIcon()}
            Log Activity for {contactName}
          </DialogTitle>
          <DialogDescription>
            Record a new activity or interaction with this contact
          </DialogDescription>
        </DialogHeader>
        <form
          id="log-activity-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FormProvider {...form}>
            <FieldGroup>
              {/* Activity Type Selection */}
              <div className="grid grid-cols-4 gap-2">
                {(() => {
                  const currentType = watchType;
                  return activityTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = currentType === type.value;
                    return (
                      <Button
                        key={type.value}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        className={`flex flex-col items-center gap-1 h-auto py-3 ${
                          isSelected ? "" : "hover:bg-muted"
                        }`}
                        onClick={() => form.setValue("type", type.value)}
                      >
                        <Icon
                          className={`h-5 w-5 ${isSelected ? "" : type.color}`}
                        />
                        <span className="text-xs">{type.label}</span>
                      </Button>
                    );
                  });
                })()}
              </div>

              <Separator />

              {/* Basic Info */}
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input
                      {...field}
                      id="title"
                      placeholder="Meeting with John Doe"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="assigneeId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="assigneeId">Assignee To</FieldLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "myself" ? undefined : value)
                        }
                        value={field.value || "myself"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="myself">Myself</SelectItem>
                          {loadingTenantMembers ? (
                            <SelectItem disabled value="loading">
                              Loading...
                            </SelectItem>
                          ) : (
                            members?.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.user.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="priority"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="priority">Priority</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityOptions.map((priority) => (
                            <SelectItem
                              key={priority.value}
                              value={priority.value}
                            >
                              <span className={priority.color}>
                                {priority.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              {/* Date and Time */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Date & Time</h3>

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="startTime"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="startTime">Start time</FieldLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP HH:mm")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                            <div className="p-3 border-t">
                              <Input
                                type="time"
                                onChange={(e) => {
                                  const date = field.value || new Date();
                                  const [hours, minutes] =
                                    e.target.value.split(":");
                                  date.setHours(
                                    parseInt(hours),
                                    parseInt(minutes),
                                  );
                                  field.onChange(date);
                                }}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="endTime"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="startTime">End time</FieldLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP HH:mm")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                            <div className="p-3 border-t">
                              <Input
                                type="time"
                                onChange={(e) => {
                                  const date = field.value || new Date();
                                  const [hours, minutes] =
                                    e.target.value.split(":");
                                  date.setHours(
                                    parseInt(hours),
                                    parseInt(minutes),
                                  );
                                  field.onChange(date);
                                }}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Controller
                    name="allDay"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FieldLabel htmlFor="allDay">All Day</FieldLabel>
                        </div>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="duration"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="duration">Duration</FieldLabel>
                        <Input
                          {...field}
                          id="duration"
                          placeholder="Enter duration in minutes"
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                          onChange={(e) =>
                            field.onChange(
                              parseInt(e.target.value) || undefined,
                            )
                          }
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>

              {/* Location/Meeting Details (conditional based on activity type) */}
              {(watchType == "MEETING" ||
                watchType === "CALL" ||
                watchType === "DEMO") && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Location & Details</h3>

                  <Controller
                    name="location"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="location">Location</FieldLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              placeholder="e.g., Conference room, Phone, Zoom..."
                              {...field}
                            />
                          </div>
                        </FormControl>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  {watchType === "MEETING" && (
                    <Controller
                      name="meetingUrl"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="meetingUrl">
                            Meeting URL
                          </FieldLabel>
                          <FormControl>
                            <div className="relative">
                              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                className="pl-9"
                                placeholder="https://meet.google.com/..."
                                {...field}
                                value={field.value || ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value ? e.target.value : undefined,
                                  )
                                }
                              />
                            </div>
                          </FormControl>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  )}
                </div>
              )}

              {/* Description and Notes */}
              <div className="space-y-4">
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="description">Description</FieldLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          id="description"
                          placeholder="Brief description of the activity..."
                          aria-invalid={fieldState.invalid}
                          className="min-h-20"
                        />
                      </FormControl>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="notes"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="notes">Notes</FieldLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          id="notes"
                          placeholder="Detailed notes, action items, next steps..."
                          aria-invalid={fieldState.invalid}
                          className="min-h-20"
                        />
                      </FormControl>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="outcome"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="outcome">Outcome</FieldLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Call connected, Demo scheduled, Follow-up needed..."
                          {...field}
                        />
                      </FormControl>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              {/* Reminder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder" className="text-sm font-medium">
                    Set Reminder
                  </Label>
                  <Switch
                    id="reminder"
                    checked={showReminder}
                    onCheckedChange={setShowReminder}
                  />
                </div>

                {showReminder && (
                  <Controller
                    name="reminderAt"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="reminderAt">
                          Reminder Me
                        </FieldLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP HH:mm")
                                ) : (
                                  <span>Set reminder time</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                            <div className="p-3 border-t">
                              <Input
                                type="time"
                                onChange={(e) => {
                                  const date = field.value || new Date();
                                  const [hours, minutes] =
                                    e.target.value.split(":");
                                  date.setHours(
                                    parseInt(hours),
                                    parseInt(minutes),
                                  );
                                  field.onChange(date);
                                }}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                )}
              </div>
            </FieldGroup>
          </FormProvider>

          <DialogFooter>
            <Button
              type="submit"
              form="log-activity-form"
              disabled={logActivityMutation.isPending}
            >
              {logActivityMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  <span>Logging...</span>
                </span>
              ) : (
                "Log Activity"
              )}
            </Button>
            <Button
              variant={"destructive"}
              onClick={() => setOpen(false)}
              disabled={logActivityMutation.isPending}
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LogContactActivity;
