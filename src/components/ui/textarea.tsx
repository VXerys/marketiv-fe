import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  label?: string;
  helperText?: string;
  error?: string;
  ref?: React.Ref<HTMLTextAreaElement>;
}

function Textarea({ className, label, helperText, error, id, name, disabled, ref, ...props }: TextareaProps) {
  const textareaId = id ?? name;
  const hasError = !!error;

  const textareaEl = (
    <textarea
      ref={ref}
      id={textareaId}
      name={name}
      disabled={disabled}
      data-slot="textarea"
      aria-invalid={hasError}
      aria-describedby={
        hasError
          ? `${textareaId}-error`
          : helperText
            ? `${textareaId}-helper`
            : undefined
      }
      className={cn(
        "resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        hasError && "border-danger focus:ring-danger focus-visible:border-destructive",
        className,
      )}
      {...props}
    />
  );

  if (!label && !helperText && !error) {
    return textareaEl;
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className={cn(
            "text-body-medium text-text-primary text-sm font-medium",
            disabled && "opacity-50"
          )}
        >
          {label}
        </label>
      )}

      {textareaEl}

      {hasError && (
        <p
          id={`${textareaId}-error`}
          role="alert"
          className="text-caption text-destructive text-xs"
        >
          {error}
        </p>
      )}

      {!hasError && helperText && (
        <p id={`${textareaId}-helper`} className="text-caption text-muted-foreground text-xs">
          {helperText}
        </p>
      )}
    </div>
  );
}

export { Textarea };
