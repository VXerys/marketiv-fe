import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  helperText?: string;
  error?: string;
  ref?: React.Ref<HTMLInputElement>;
}

function Input({ className, type, label, helperText, error, id, name, disabled, ref, ...props }: InputProps) {
  const inputId = id ?? name;
  const hasError = !!error;

  const inputEl = (
    <input
      ref={ref}
      id={inputId}
      name={name}
      disabled={disabled}
      type={type}
      data-slot="input"
      aria-invalid={hasError}
      aria-describedby={
        hasError
          ? `${inputId}-error`
          : helperText
            ? `${inputId}-helper`
            : undefined
      }
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        hasError && "border-danger focus:ring-danger focus-visible:border-destructive",
        className,
      )}
      {...props}
    />
  );

  // If there's no label, helperText, or error, just return the raw input
  if (!label && !helperText && !error) {
    return inputEl;
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "text-body-medium text-text-primary text-sm font-medium",
            disabled && "opacity-50"
          )}
        >
          {label}
        </label>
      )}

      {inputEl}

      {hasError && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-caption text-destructive text-xs"
        >
          {error}
        </p>
      )}

      {!hasError && helperText && (
        <p id={`${inputId}-helper`} className="text-caption text-muted-foreground text-xs">
          {helperText}
        </p>
      )}
    </div>
  );
}

export { Input };
