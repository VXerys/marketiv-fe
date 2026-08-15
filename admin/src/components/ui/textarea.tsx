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
        "resize-none placeholder:text-text-muted flex min-h-[90px] w-full rounded-xl border border-neutral-300/80 bg-neutral-100/60 px-4 py-3 text-sm font-semibold text-ink-950 shadow-3xs transition-all outline-none hover:border-neutral-400/80 hover:bg-neutral-100/90 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        hasError && "border-red-400 focus:border-red-500 focus:ring-red-500/15",
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
            "text-body-medium text-ink-950 text-xs sm:text-sm font-extrabold select-none cursor-pointer",
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
          className="text-caption text-red-600 text-xs font-bold"
        >
          {error}
        </p>
      )}

      {!hasError && helperText && (
        <p id={`${textareaId}-helper`} className="text-caption text-text-muted text-xs font-semibold">
          {helperText}
        </p>
      )}
    </div>
  );
}

export { Textarea };
