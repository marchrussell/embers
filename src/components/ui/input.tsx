import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ref, ...props }: React.ComponentProps<"input">) {
  // Check if this is a date/time input type that needs calendar picker styling
  const isDateTimeInput = type === "datetime-local" || type === "date" || type === "time";

  return (
    <input
      type={type}
      className={cn(
        "flex h-14 w-full rounded-md border border-border bg-input px-5 py-4 text-lg text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-lg file:font-medium file:text-foreground placeholder:text-muted-foreground/60 focus-visible:border-border focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-lg",
        // Apply calendar/clock picker styling for dark backgrounds
        isDateTimeInput &&
          "[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-datetime-edit]:flex-1",
        className
      )}
      ref={ref}
      {...props}
    />
  );
}
Input.displayName = "Input";

export { Input };
