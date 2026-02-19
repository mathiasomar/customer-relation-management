"use client";

import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Clock,
  User,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ContactInfoProps {
  contact: any;
}

export function ContactInfo({ contact }: ContactInfoProps) {
  const getLocation = () => {
    const parts = [];
    if (contact.city) parts.push(contact.city);
    if (contact.state) parts.push(contact.state);
    if (contact.country) parts.push(contact.country);
    return parts.join(", ");
  };

  const location = getLocation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Contact Details Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            Contact Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          {contact.email && (
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm text-primary hover:underline"
                >
                  {contact.email}
                </a>
              </div>
            </div>
          )}

          {/* Phone */}
          {contact.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-sm text-primary hover:underline"
                >
                  {contact.phone}
                </a>
              </div>
            </div>
          )}

          {/* Mobile */}
          {contact.mobile && (
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Mobile</p>
                <a
                  href={`tel:${contact.mobile}`}
                  className="text-sm text-primary hover:underline"
                >
                  {contact.mobile}
                </a>
              </div>
            </div>
          )}

          {/* Location */}
          {location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">{location}</p>
                {contact.street && (
                  <p className="text-sm text-muted-foreground">
                    {contact.street}
                  </p>
                )}
                {contact.postalCode && (
                  <p className="text-sm text-muted-foreground">
                    Postal Code: {contact.postalCode}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Timezone */}
          {contact.timezone && (
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Timezone</p>
                <p className="text-sm text-muted-foreground">
                  {contact.timezone}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            Professional Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Job Title */}
          {contact.jobTitle && (
            <div className="flex items-start gap-3">
              <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Job Title</p>
                <p className="text-sm text-muted-foreground">
                  {contact.jobTitle}
                </p>
              </div>
            </div>
          )}

          {/* Department */}
          {contact.department && (
            <div className="flex items-start gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Department</p>
                <p className="text-sm text-muted-foreground">
                  {contact.department}
                </p>
              </div>
            </div>
          )}

          {/* Company */}
          {contact.company && (
            <div className="flex items-start gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Company</p>
                <p className="text-sm text-muted-foreground">
                  {contact.company}
                </p>
              </div>
            </div>
          )}

          {/* Website/Source */}
          {contact.source && (
            <div className="flex items-start gap-3">
              <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Source</p>
                <p className="text-sm text-muted-foreground">
                  {contact.source}
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Social Media */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Social Media</p>
            <div className="flex gap-2">
              {contact.linkedin && (
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
              {contact.twitter && (
                <a
                  href={`https://twitter.com/${contact.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </a>
              )}
              {contact.facebook && (
                <a
                  href={contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </a>
              )}
            </div>
          </div>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map(({ tag, assignedBy }: any) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: tag.color
                          ? `${tag.color}20`
                          : undefined,
                        borderColor: tag.color,
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Assignee */}
          {contact.assignee && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Assigned To</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={contact.assignee.image || undefined} />
                    <AvatarFallback className="text-xs">
                      {contact.assignee.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {contact.assignee.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {contact.assignee.email}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {contact.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {contact.notes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
