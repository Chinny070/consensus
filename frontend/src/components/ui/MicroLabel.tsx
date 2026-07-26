"use client";

import clsx from "clsx";

interface MicroLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function MicroLabel({ children, className }: MicroLabelProps) {
  return (
    <span
      className={clsx(
        "font-mono text-[10px] uppercase tracking-[0.12em] text-ink-800",
        className
      )}
    >
      {children}
    </span>
  );
}
