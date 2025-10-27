"use client";

import React from "react";

export interface CalendarProps {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
  className?: string;
}

// Minimal Calendar component compatible with existing usages in the app.
// Renders a native date input and adapts props to match the expected API.
export function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  className,
}: CalendarProps) {
  const value = selected ? new Date(selected) : undefined;
  const formatted = value ? new Date(value.getTime() - value.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10) : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!v) {
      onSelect?.(undefined);
      return;
    }
    const d = new Date(v + "T00:00:00");
    if (disabled && disabled(d)) {
      return;
    }
    onSelect?.(d);
  };

  return (
    <input
      type="date"
      value={formatted}
      onChange={handleChange}
      className={className}
      aria-label="Calendar"
    />
  );
}

export default Calendar;
