"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button, Input, FieldWrapper } from "@/components/design-system";
import { IconX, IconPlus } from "@/components/icons";
import type { StakeholderRow } from "../brief";

export interface StakeholdersInputProps {
  rows: StakeholderRow[];
  error?: string | null;
  prefersReducedMotion: boolean;
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: "name" | "role", value: string) => void;
}

export function StakeholdersInput({
  rows,
  error,
  prefersReducedMotion,
  onAdd,
  onRemove,
  onUpdate,
}: StakeholdersInputProps) {
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const prevIds = useRef<number[]>(rows.map((r) => r.id));

  // Animate any newly-added row.
  useGSAP(() => {
    if (prefersReducedMotion) {
      prevIds.current = rows.map((r) => r.id);
      return;
    }
    const added = rows.map((r) => r.id).filter((id) => !prevIds.current.includes(id));
    added.forEach((id) => {
      const el = rowRefs.current.get(id);
      if (el) {
        gsap.from(el, { opacity: 0, y: -12, scale: 0.98, duration: 0.25, ease: "power2.out" });
      }
    });
    prevIds.current = rows.map((r) => r.id);
  }, [rows, prefersReducedMotion]);

  const handleRemove = (id: number) => {
    if (rows.length <= 1) return;
    const el = rowRefs.current.get(id);
    if (el && !prefersReducedMotion) {
      gsap.to(el, {
        opacity: 0,
        height: 0,
        marginTop: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          rowRefs.current.delete(id);
          onRemove(id);
        },
      });
    } else {
      rowRefs.current.delete(id);
      onRemove(id);
    }
  };

  return (
    <FieldWrapper label="Stakeholders" hint={`${rows.length} people`} error={error ?? undefined}>
      <div className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <div
            key={row.id}
            ref={(el) => {
              if (el) rowRefs.current.set(row.id, el);
              else rowRefs.current.delete(row.id);
            }}
            className="flex gap-2 sm:gap-3 items-start bg-surface-2 rounded-xl border border-border p-3 sm:p-4 transition-colors hover:border-border-strong"
          >
            <div className="flex-1 min-w-0">
              <Input
                value={row.name}
                onChange={(e) => onUpdate(row.id, "name", e.target.value)}
                placeholder="Name"
                aria-label={`Stakeholder ${index + 1} name`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <Input
                value={row.role}
                onChange={(e) => onUpdate(row.id, "role", e.target.value)}
                placeholder="Role"
                aria-label={`Stakeholder ${index + 1} role`}
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemove(row.id)}
              disabled={rows.length <= 1}
              className={[
                "flex items-center justify-center w-11 h-11 rounded-lg shrink-0",
                "border border-border-strong bg-overlay text-tertiary",
                "hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                rows.length <= 1 ? "opacity-40 cursor-not-allowed" : "",
              ].join(" ")}
              aria-label={`Remove stakeholder ${index + 1}`}
            >
              <IconX size={14} />
            </button>
          </div>
        ))}

        <Button type="button" variant="secondary" size="md" onClick={onAdd} trailingIcon={<IconPlus size={14} />}>
          Add stakeholder
        </Button>
      </div>
    </FieldWrapper>
  );
}
