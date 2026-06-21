"use client";

import { Input, FieldWrapper } from "@/components/design-system";

export interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  error?: string | null;
  autoFocus?: boolean;
  placeholder?: string;
}

export function TextInput({
  id,
  label,
  value,
  onChange,
  onSubmit,
  error,
  autoFocus,
  placeholder,
}: TextInputProps) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error ?? undefined}>
      <Input
        id={id}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        error={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
      />
    </FieldWrapper>
  );
}
