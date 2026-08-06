"use client";

import * as Label from "@radix-ui/react-label";
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const inputCls =
  "w-full min-h-[44px] px-4 py-2.5 bg-neutral-50/70 border border-neutral-200/90 rounded-xl text-sm font-semibold text-ink-950 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 transition-all shadow-3xs disabled:cursor-not-allowed disabled:opacity-60";
const errCls = "text-[0.7rem] font-bold text-red-600";
const labelCls = "text-[0.74rem] font-extrabold text-ink-950 select-none cursor-pointer";

interface AuthFieldProps extends Omit<React.ComponentProps<"input">, "id"> {
  label: string;
  error?: string;
  hint?: string;
}

export function AuthField({
  label,
  error,
  hint,
  className,
  ...props
}: AuthFieldProps) {
  const autoId = useId();
  const id = props.name ?? autoId;

  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root htmlFor={id} className={labelCls}>
        {label}
      </Label.Root>
      <input
        {...props}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(inputCls, error && "border-red-400 focus:border-red-500", className)}
      />
      {error ? (
        <span id={`${id}-error`} role="alert" className={errCls}>
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="text-[0.7rem] font-semibold text-text-muted">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

/** Field password dengan toggle lihat/sembunyikan. */
export function PasswordField({
  label,
  error,
  hint,
  ...props
}: Omit<AuthFieldProps, "type">) {
  const [visible, setVisible] = useState(false);
  const autoId = useId();
  const id = props.name ?? autoId;

  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root htmlFor={id} className={labelCls}>
        {label}
      </Label.Root>
      <div className="relative">
        <input
          {...props}
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(inputCls, "pr-11", error && "border-red-400 focus:border-red-500")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-text-muted transition-colors hover:text-ink-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500/40 cursor-pointer"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error ? (
        <span id={`${id}-error`} role="alert" className={errCls}>
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="text-[0.7rem] font-semibold text-text-muted">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

interface AuthSelectFieldProps {
  label: string;
  error?: string;
  placeholder?: string;
  value: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (e: any) => void;
  options: readonly { value: string; label: string }[];
  name?: string;
  disabled?: boolean;
  className?: string;
}

/** Radix UI Select Dropdown konsisten dengan desain sistem Marketiv. */
export function AuthSelectField({
  label,
  error,
  placeholder = "Pilih kategori…",
  options,
  value,
  onChange,
  name,
  disabled,
  className,
}: AuthSelectFieldProps) {
  const autoId = useId();
  const id = name ?? autoId;

  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root htmlFor={id} className={labelCls}>
        {label}
      </Label.Root>

      <Select
        disabled={disabled}
        value={value || undefined}
        onValueChange={(val) => {
          onChange({
            target: { value: val, name: name ?? "category" },
            currentTarget: { value: val, name: name ?? "category" },
          });
        }}
      >
        <SelectTrigger
          id={id}
          aria-invalid={!!error}
          className={cn(
            "w-full min-h-[44px] h-auto px-4 py-2.5 bg-neutral-50/70 border border-neutral-200/90 rounded-xl text-xs sm:text-sm font-semibold text-ink-950 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15 transition-all shadow-3xs disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer",
            error && "border-red-400 focus:border-red-500",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className="z-[100] max-h-60 rounded-xl border border-neutral-200/80 bg-white p-1.5 shadow-2xl">
          {options.map((o) => (
            <SelectItem
              key={o.value}
              value={o.value}
              className="rounded-lg px-3 py-2 text-xs font-bold text-ink-950 cursor-pointer focus:bg-orange-50 focus:text-orange-600 data-[state=checked]:bg-orange-50 data-[state=checked]:text-orange-600 transition-colors"
            >
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <span id={`${id}-error`} role="alert" className={errCls}>
          {error}
        </span>
      )}
    </div>
  );
}

interface AuthTextareaFieldProps extends Omit<React.ComponentProps<"textarea">, "id"> {
  label: string;
  error?: string;
  hint?: string;
}

/** Textarea dengan tampilan sama persis dengan AuthField. */
export function AuthTextareaField({
  label,
  error,
  hint,
  className,
  rows = 4,
  ...props
}: AuthTextareaFieldProps) {
  const autoId = useId();
  const id = props.name ?? autoId;

  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root htmlFor={id} className={labelCls}>
        {label}
      </Label.Root>
      <textarea
        {...props}
        id={id}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(
          inputCls,
          "resize-y leading-relaxed",
          error && "border-red-400 focus:border-red-500",
          className
        )}
      />
      {error ? (
        <span id={`${id}-error`} role="alert" className={errCls}>
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="text-[0.7rem] font-semibold text-text-muted">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

/** Banner error non-field. */
export function AuthErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200/70 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"
    >
      {message}
    </div>
  );
}
