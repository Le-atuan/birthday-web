"use client";

import { FieldShell } from "@/components/field-shell";

export function TextField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  name,
  required = false,
  error,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  name: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <FieldShell label={label} error={error}>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className={`h-13 w-full rounded-2xl border bg-bg-elevated px-4 text-base text-fg outline-none placeholder:text-fg-muted/60 focus:border-accent ${
          error ? "border-danger" : "border-border"
        }`}
      />
    </FieldShell>
  );
}
