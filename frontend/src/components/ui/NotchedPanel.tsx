"use client";

import { type ReactNode } from "react";
import clsx from "clsx";

interface NotchedPanelProps {
  children: ReactNode;
  variant?: "bone" | "ink" | "void";
  notch?: "tr" | "bl" | "both" | "none";
  className?: string;
  border?: boolean;
}

export function NotchedPanel({
  children,
  variant = "bone",
  notch = "tr",
  className,
  border = true,
}: NotchedPanelProps) {
  const bg = {
    bone: "bg-bone-100",
    ink: "bg-ink-950 text-bone-000",
    void: "bg-void-1000 text-bone-000",
  }[variant];

  const clipClass = {
    tr: "notch-tr",
    bl: "notch-bl",
    both: "notch-both",
    none: "",
  }[notch];

  return (
    <div
      className={clsx(
        bg,
        clipClass,
        border && "border-2 border-ink-950",
        "relative",
        className
      )}
    >
      {children}
    </div>
  );
}
