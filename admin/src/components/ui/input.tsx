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
        "file:text-foreground placeholder:text-text-muted flex min-h-[44px] w-full min-w-0 rounded-xl border border-neutral-300/80 bg-neutral-100/60 px-4 py-2.5 text-sm font-semibold text-ink-950 shadow-3xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:border-neutral-400/80 hover:bg-neutral-100/90 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        hasError && "border-red-400 focus:border-red-500 focus:ring-red-500/15",
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
            "text-body-medium text-ink-950 text-xs sm:text-sm font-extrabold select-none cursor-pointer",
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
          className="text-caption text-red-600 text-xs font-bold"
        >
          {error}
        </p>
      )}

      {!hasError && helperText && (
        <p id={`${inputId}-helper`} className="text-caption text-text-muted text-xs font-semibold">
          {helperText}
        </p>
      )}
    </div>
  );
}

export { Input };
