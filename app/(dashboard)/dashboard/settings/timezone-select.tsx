import React, { useState, useMemo } from "react";
import { Controller } from "react-hook-form";
import moment from "moment-timezone";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
  region: string;
}

interface TimezoneSelectProps {
  control: any;
  name?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  showOffset?: boolean;
  className?: string;
}

export const TimezoneSelect = ({
  control,
  name = "timezone",
  label = "Timezone",
  placeholder = "Select timezone...",
  defaultValue = moment.tz.guess(),
  required = false,
  showOffset = true,
  className = "",
}: TimezoneSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Get all timezones with their data
  const timezoneOptions = useMemo(() => {
    const allTimezones = moment.tz.names();
    const uniqueTimezones = [...new Set(allTimezones)];

    const options: TimezoneOption[] = uniqueTimezones.map((tzName) => {
      const momentTz = moment.tz(tzName);
      const offset = momentTz.utcOffset();
      //   const offsetFormatted = momentTz.format("Z");

      // Format label
      const label = tzName.replace(/_/g, " ");

      // Format offset display
      const offsetHours = Math.abs(Math.floor(offset / 60));
      const offsetMinutes = Math.abs(offset % 60);
      const offsetSign = offset >= 0 ? "+" : "-";
      const offsetStr = `UTC${offsetSign}${offsetHours
        .toString()
        .padStart(2, "0")}:${offsetMinutes.toString().padStart(2, "0")}`;

      // Get region
      const parts = tzName.split("/");
      const region = parts.length > 1 ? parts[0] : "Other";

      return {
        value: tzName,
        label,
        offset: offsetStr,
        region,
      };
    });

    // Sort by offset, then by label
    options.sort((a, b) => {
      const offsetA = moment.tz(a.value).utcOffset();
      const offsetB = moment.tz(b.value).utcOffset();
      if (offsetA !== offsetB) return offsetA - offsetB;
      return a.label.localeCompare(b.label);
    });

    return options;
  }, []);

  // Group timezones by region
  const groupedTimezones = useMemo(() => {
    const groups: Record<string, TimezoneOption[]> = {};

    // Popular timezones first
    const popularTimezones = [
      "UTC",
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Paris",
      "Europe/Berlin",
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Australia/Sydney",
    ];

    // Create Popular group
    groups["Popular"] = timezoneOptions.filter((tz) =>
      popularTimezones.includes(tz.value),
    );

    // Group remaining timezones by region
    timezoneOptions.forEach((tz) => {
      if (!popularTimezones.includes(tz.value)) {
        if (!groups[tz.region]) {
          groups[tz.region] = [];
        }
        groups[tz.region].push(tz);
      }
    });

    // Sort regions alphabetically
    const sortedGroups: Record<string, TimezoneOption[]> = {};
    Object.keys(groups)
      .sort()
      .forEach((key) => {
        sortedGroups[key] = groups[key];
      });

    return sortedGroups;
  }, [timezoneOptions]);

  // Filtered groups based on search
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groupedTimezones;

    const filtered: Record<string, TimezoneOption[]> = {};

    Object.entries(groupedTimezones).forEach(([region, timezones]) => {
      const filteredTimezones = timezones.filter(
        (tz) =>
          tz.label.toLowerCase().includes(search.toLowerCase()) ||
          tz.value.toLowerCase().includes(search.toLowerCase()) ||
          tz.region.toLowerCase().includes(search.toLowerCase()) ||
          tz.offset.toLowerCase().includes(search.toLowerCase()),
      );

      if (filteredTimezones.length > 0) {
        filtered[region] = filteredTimezones;
      }
    });

    return filtered;
  }, [groupedTimezones, search]);

  // Get current time in selected timezone
  const getCurrentTime = (timezone: string) => {
    return moment.tz(timezone).format("hh:mm A");
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={{
        required: required ? `${label} is required` : false,
      }}
      render={({ field, fieldState }) => {
        const selectedTimezone = timezoneOptions.find(
          (tz) => tz.value === field.value,
        );

        return (
          <Field className={className} data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={name}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </FieldLabel>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  aria-invalid={fieldState.invalid}
                  className={cn(
                    "w-full justify-between font-normal",
                    !field.value && "text-muted-foreground",
                    fieldState.invalid && "border-red-500",
                  )}
                >
                  {field.value ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="truncate">
                          {selectedTimezone?.label || field.value}
                        </span>
                        {showOffset && selectedTimezone && (
                          <span className="text-sm text-gray-500">
                            {selectedTimezone.offset}
                          </span>
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  ) : (
                    <>
                      {placeholder}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search timezone..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList className="max-h-100">
                    <CommandEmpty>No timezone found.</CommandEmpty>

                    {Object.entries(filteredGroups).map(
                      ([region, timezones]) => (
                        <CommandGroup key={region} heading={region}>
                          {timezones.map((tz) => (
                            <CommandItem
                              key={tz.value}
                              value={tz.value}
                              onSelect={() => {
                                field.onChange(tz.value);
                                setOpen(false);
                                setSearch("");
                              }}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === tz.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{tz.label}</span>
                                  {showOffset && (
                                    <span className="text-xs text-gray-500">
                                      {tz.offset}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {field.value === tz.value && (
                                <span className="text-xs text-gray-500">
                                  {getCurrentTime(tz.value)}
                                </span>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ),
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {field.value && !fieldState.invalid && (
              <div className="mt-1 text-sm text-gray-600">
                Current time: {moment.tz(field.value).format("LLLL")}
              </div>
            )}

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
};
