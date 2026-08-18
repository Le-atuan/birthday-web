"use client";

import { FieldShell } from "@/components/field-shell";

export function DateField({
  label,
  value,
  onChange,
  name,
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <FieldShell label={label} error={error}>
      <input
        type="date"
        name={name}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className={`h-13 w-full rounded-2xl border bg-bg-elevated px-4 text-base text-fg outline-none scheme-dark focus:border-accent ${
          error ? "border-danger" : "border-border"
        }`}
      />
    </FieldShell>
  );
}
