"use client";

import { Contact } from "@/generated/prisma/client";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Activity,
  Briefcase,
  Building2,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  PhoneCall,
  Star,
  Target,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Calendar } from "../ui/calendar";

const ContactCard = ({ contact }: { contact: Contact }) => {
  const getInitials = () => {
    return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
  };

  const getFullName = () => {
    return `${contact.firstName} ${contact.lastName}`;
  };

  const getLocation = () => {
    if (contact.city && contact.country) {
      return `${contact.city}, ${contact.country}`;
    }
    if (contact.city) return contact.city;
    if (contact.country) return contact.country;
    return null;
  };

  const getPrimaryContact = () => {
    if (contact.email)
      return { type: "email", value: contact.email, icon: Mail };
    if (contact.phone)
      return { type: "phone", value: contact.phone, icon: Phone };
    if (contact.mobile)
      return { type: "mobile", value: contact.mobile, icon: Phone };
    return null;
  };

  const primaryContact = getPrimaryContact();
  const location = getLocation();

  // Calculate engagement score (example logic)
  const totalActivities = contact._count?.activities || 0;
  const totalTasks = contact._count?.tasks || 0;
  const totalDeals = contact._count?.deals || 0;
  const engagementScore = Math.min(
    Math.round((totalActivities + totalTasks * 2 + totalDeals * 3) / 2),
    100,
  );
  return (
    <Link href={`/dashboard/contacts/${contact.id}`}>
      <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer h-full flex flex-col">
        {/* Status Indicator */}
        <div
          className={`absolute top-0 left-0 w-1 h-full ${contact.isActive ? "bg-green-500" : "bg-gray-300"}`}
        />

        <CardContent className="p-6 flex-1">
          {/* Header with Avatar and Actions */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-muted group-hover:border-primary transition-colors">
                <AvatarImage src={contact.avatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg leading-none group-hover:text-primary transition-colors">
                  {getFullName()}
                </h3>
                {contact.jobTitle && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Briefcase className="h-3 w-3" />
                    {contact.jobTitle}
                  </p>
                )}
              </div>
            </div>

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.preventDefault()}
              >
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Call
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Activity className="mr-2 h-4 w-4" />
                  Log Activity
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Target className="mr-2 h-4 w-4" />
                  Create Opportunity
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Company & Location */}
          <div className="mt-4 space-y-2">
            {contact.company && (
              <p className="text-sm flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{contact.company}</span>
              </p>
            )}

            {location && (
              <p className="text-sm flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{location}</span>
              </p>
            )}

            {primaryContact && (
              <p className="text-sm flex items-center gap-2 text-muted-foreground">
                <primaryContact.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{primaryContact.value}</span>
              </p>
            )}
          </div>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1">
              {contact.tags.slice(0, 3).map(({ tag }) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: tag.color ? `${tag.color}20` : undefined,
                    borderColor: tag.color,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
              {contact.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{contact.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Engagement Score */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Engagement Score</span>
              <span>{engagementScore}%</span>
            </div>
            <Progress value={engagementScore} className="h-1.5" />
          </div>

          {/* Assignee */}
          {contact.assignee && (
            <div className="mt-4 flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={contact.assignee.image || undefined} />
                <AvatarFallback className="text-[10px]">
                  {contact.assignee.name[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                Assigned to {contact.assignee.name}
              </span>
            </div>
          )}
        </CardContent>

        {/* Footer with Stats */}
        <CardFooter className="border-t bg-muted/30 p-3 mt-auto">
          <div className="flex w-full items-center justify-between text-xs">
            <TooltipProvider>
              <div className="flex items-center gap-3">
                {/* Deals */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Target className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{contact._count?.deals || 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Deals: {contact._count?.deals || 0}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Opportunities */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{contact._count?.opportunities || 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Opportunities: {contact._count?.opportunities || 0}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Activities */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{contact._count?.activities || 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Activities: {contact._count?.activities || 0}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Notes */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{contact._count?.notesList || 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notes: {contact._count?.notesList || 0}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            {/* Last Contacted */}
            {contact.lastContactedAt && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {new Date(contact.lastContactedAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Last contacted:{" "}
                      {new Date(contact.lastContactedAt).toLocaleDateString()}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardFooter>

        {/* Hover overlay with quick actions */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </Card>
    </Link>
  );
};

export default ContactCard;
