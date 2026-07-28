"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Field form auth.
 *
 * Kelasnya sengaja meniru inputCls/errCls di PengaturanClient supaya form auth
 * terlihat sama dengan form dashboard yang sudah ada — bukan varian baru.
 * Tinggi 44px memenuhi aturan tap target minimum (Studio System v5.8).
 */

const inputCls =
  "w-full min-h-[44px] px-4 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm font-semibold text-ink-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all shadow-3xs disabled:cursor-not-allowed disabled:opacity-60";
const errCls = "text-[0.7rem] font-bold text-red-600";
const labelCls = "text-[0.74rem] font-[800] text-ink-600";

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
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
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
        <span id={`${id}-hint`} className="text-[0.7rem] font-semibold text-ink-500">
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
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
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
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-ink-500 transition-colors hover:text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500/40"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error ? (
        <span id={`${id}-error`} role="alert" className={errCls}>
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="text-[0.7rem] font-semibold text-ink-500">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

interface AuthSelectFieldProps extends Omit<React.ComponentProps<"select">, "id"> {
  label: string;
  error?: string;
  placeholder?: string;
  options: readonly { value: string; label: string }[];
}

/** Select dengan tampilan sama persis dengan AuthField. */
export function AuthSelectField({
  label,
  error,
  placeholder = "Pilih…",
  options,
  className,
  ...props
}: AuthSelectFieldProps) {
  const autoId = useId();
  const id = props.name ?? autoId;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <select
        {...props}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          inputCls,
          "cursor-pointer",
          error && "border-red-400 focus:border-red-500",
          className
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${id}-error`} role="alert" className={errCls}>
          {error}
        </span>
      )}
    </div>
  );
}

/** Banner error non-field (kegagalan dari service, bukan dari validasi Zod). */
export function AuthErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200/70 bg-red-50 px-4 py-3 text-[0.78rem] font-semibold text-red-700"
    >
      {message}
    </div>
  );
}
