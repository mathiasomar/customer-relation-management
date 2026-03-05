import React from "react";
import { Calendar } from "@/components/ui/calendar";

interface CalendarComponentProps {
  mode: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  initialFocus?: boolean;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  mode,
  selected,
  onSelect,
  initialFocus,
}) => {
  return (
    <Calendar
      mode={mode}
      selected={selected}
      onSelect={onSelect}
      initialFocus={initialFocus}
    />
  );
};

export default CalendarComponent;
