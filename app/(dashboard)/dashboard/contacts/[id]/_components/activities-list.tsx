"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Phone,
  Mail,
  Video,
  Calendar,
  FileText,
  Star,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  startTime?: Date | null;
  endTime?: Date | null;
  duration?: number | null;
  location?: string | null;
  meetingUrl?: string | null;
  outcome?: string | null;
  notes?: string | null;
  createdAt: Date;
  assignee?: {
    id: string;
    name: string;
    image?: string | null;
  } | null;
  creator?: {
    id: string;
    name: string;
  } | null;
}

interface ActivitiesListProps {
  activities: Activity[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const activityIcons = {
  CALL: { icon: Phone, color: "text-blue-500", bgColor: "bg-blue-100" },
  EMAIL: { icon: Mail, color: "text-green-500", bgColor: "bg-green-100" },
  MEETING: { icon: Video, color: "text-purple-500", bgColor: "bg-purple-100" },
  TASK: {
    icon: CheckCircle2,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
  },
  NOTE: { icon: FileText, color: "text-gray-500", bgColor: "bg-gray-100" },
  DEMO: { icon: Star, color: "text-yellow-500", bgColor: "bg-yellow-100" },
  FOLLOW_UP: {
    icon: Clock,
    color: "text-indigo-500",
    bgColor: "bg-indigo-100",
  },
} as const;

const priorityColors = {
  LOW: "text-gray-500 bg-gray-100",
  MEDIUM: "text-blue-500 bg-blue-100",
  HIGH: "text-orange-500 bg-orange-100",
  URGENT: "text-red-500 bg-red-100",
};

const statusColors = {
  SCHEDULED: "text-purple-500 bg-purple-100",
  IN_PROGRESS: "text-blue-500 bg-blue-100",
  COMPLETED: "text-green-500 bg-green-100",
  CANCELLED: "text-gray-500 bg-gray-100",
};

export function ActivitiesList({
  activities,
  isLoading,
  onRefresh,
}: ActivitiesListProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredActivities = activities.filter((activity) => {
    if (filter === "all") return true;
    return activity.type === filter;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activities</CardTitle>
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

  const getActivityIcon = (type: string) => {
    const activity =
      activityIcons[type as keyof typeof activityIcons] || activityIcons.NOTE;
    const Icon = activity.icon;
    return (
      <div className={`p-2 rounded-lg ${activity.bgColor}`}>
        <Icon className={`h-4 w-4 ${activity.color}`} />
      </div>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Activities</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32.5">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="CALL">Calls</SelectItem>
              <SelectItem value="EMAIL">Emails</SelectItem>
              <SelectItem value="MEETING">Meetings</SelectItem>
              <SelectItem value="TASK">Tasks</SelectItem>
              <SelectItem value="NOTE">Notes</SelectItem>
              <SelectItem value="DEMO">Demos</SelectItem>
              <SelectItem value="FOLLOW_UP">Follow-ups</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-muted/30 rounded-lg p-6 max-w-sm mx-auto">
              <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-sm font-medium mb-1">No activities yet</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Log your first activity to start tracking interactions
              </p>
              <Button size="sm" variant="outline">
                <Clock className="mr-2 h-3 w-3" />
                Log Activity
              </Button>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-100 pr-4">
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  {getActivityIcon(activity.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-medium">
                          {activity.title}
                        </h4>
                        {activity.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Add Note
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Clock className="mr-2 h-4 w-4" />
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          priorityColors[
                            activity.priority as keyof typeof priorityColors
                          ]
                        }`}
                      >
                        {activity.priority}
                      </Badge>

                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          statusColors[
                            activity.status as keyof typeof statusColors
                          ]
                        }`}
                      >
                        {activity.status}
                      </Badge>

                      {activity.startTime && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(
                              new Date(activity.startTime),
                              "MMM d, h:mm a",
                            )}
                          </span>
                        </div>
                      )}

                      {activity.duration && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{activity.duration} min</span>
                        </div>
                      )}

                      {activity.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-37.5">
                            {activity.location}
                          </span>
                        </div>
                      )}
                    </div>

                    {activity.outcome && (
                      <div className="mt-2 text-xs">
                        <span className="font-medium">Outcome:</span>{" "}
                        <span className="text-muted-foreground">
                          {activity.outcome}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        {activity.assignee && (
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage
                                src={activity.assignee.image || undefined}
                              />
                              <AvatarFallback className="text-[8px]">
                                {getInitials(activity.assignee.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {activity.assignee.name}
                            </span>
                          </div>
                        )}

                        {activity.creator && (
                          <span className="text-xs text-muted-foreground">
                            Created by {activity.creator.name}
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {activity.notes && (
                      <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                        <p className="text-muted-foreground">
                          {activity.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
