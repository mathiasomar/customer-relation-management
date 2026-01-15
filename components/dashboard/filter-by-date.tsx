"use client";

import React from "react";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const FilterByDate = () => {
  const [openStart, setOpenStart] = React.useState(false);
  const [openEnd, setOpenEnd] = React.useState(false);
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleStartDate = (filter: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("startDate", filter || "");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleEndDate = (filter: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("endDate", filter || "");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClearFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("startDate");
    params.delete("endDate");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    setStartDate(undefined);
    setEndDate(undefined);
  };
  return (
    <div className="flex items-center flex-col gap-4 md:flex-row">
      <div className="flex items-center gap-2">
        <Label htmlFor="date" className="px-1">
          From:
        </Label>
        <Popover open={openStart} onOpenChange={setOpenStart}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date"
              className="w-48 justify-between font-normal"
            >
              {startDate ? startDate.toLocaleDateString() : "Select start date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              captionLayout="dropdown"
              onSelect={(date) => {
                if (date) {
                  setStartDate(date);
                  setOpenStart(false);
                  handleStartDate(date.toISOString());
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="date" className="px-1">
          To:
        </Label>
        <Popover open={openEnd} onOpenChange={setOpenEnd}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date"
              className="w-48 justify-between font-normal"
            >
              {endDate ? endDate.toLocaleDateString() : "Select end date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              captionLayout="dropdown"
              onSelect={(date) => {
                if (date) {
                  setEndDate(date);
                  setOpenEnd(false);
                  handleEndDate(date.toISOString());
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <Button variant="outline" onClick={handleClearFilter}>
        Clear
      </Button>
    </div>
  );
};

export default FilterByDate;
