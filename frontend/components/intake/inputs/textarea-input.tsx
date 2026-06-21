"use client";

import { TextArea, FieldWrapper } from "@/components/design-system";

export interface TextareaInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  error?: string | null;
  autoFocus?: boolean;
  placeholder?: string;
  hint?: string;
}

export function TextareaInput({
  id,
  label,
  value,
  onChange,
  onSubmit,
  error,
  autoFocus,
  placeholder,
  hint,
}: TextareaInputProps) {
  return (
    <FieldWrapper label={label} htmlFor={id} hint={hint} error={error ?? undefined}>
      <TextArea
        id={id}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        error={Boolean(error)}
        className="min-h-[96px] sm:min-h-[120px]"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onSubmit();
          }
        }}
      />
    </FieldWrapper>
  );
}
