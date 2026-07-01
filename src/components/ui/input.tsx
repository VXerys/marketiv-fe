/**
 * Input — UI Primitive
 *
 * Accessible text input with:
 * - Optional label
 * - Helper text
 * - Error message
 * - Disabled state
 * - Focus ring using orange (border-focus token)
 * - forwardRef compatible
 *
 * Uses:    cn
 * Tokens:  @theme design tokens from globals.css
 */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visible label above the input. */
  label?: string;
  /** Helper text below the input. */
  helperText?: string;
  /** Error message — replaces helperText and marks field invalid. */
  error?: string;
  /** ID for label association. Defaults to `name` prop if not provided. */
  id?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { label, helperText, error, id, name, className, disabled, ...props },
    ref
  ) {
    const inputId = id ?? name;
    const hasError = !!error;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-body-medium text-text-primary",
              disabled && "opacity-50"
            )}
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          className={cn(
            // Base
            "w-full rounded-md border bg-surface px-3.5 py-2.5",
            "text-body-base text-text-primary placeholder:text-text-muted",
            "transition-colors duration-150",
            // Border
            "border-border-subtle",
            // Focus
            "focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-border-focus",
            // Error
            hasError && "border-danger focus:ring-danger",
            // Disabled
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50",
            className
          )}
          {...props}
        />

        {hasError && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-caption text-danger"
          >
            {error}
          </p>
        )}

        {!hasError && helperText && (
          <p id={`${inputId}-helper`} className="text-caption text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
