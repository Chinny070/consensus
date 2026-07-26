"use client";

import { type ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface StampedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "acid" | "ink" | "ember" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function StampedButton({
  children,
  variant = "acid",
  size = "md",
  className,
  disabled,
  ...props
}: StampedButtonProps) {
  const base =
    "relative font-mono uppercase tracking-widest font-bold border-2 transition-all cursor-pointer select-none inline-flex items-center justify-center";

  const variants = {
    acid: "bg-acid-500 border-ink-950 text-ink-950 hover:brightness-110 active:brightness-95",
    ink: "bg-ink-950 border-ink-950 text-bone-000 hover:bg-ink-800",
    ember: "bg-ember-500 border-ink-950 text-bone-000 hover:brightness-110",
    ghost:
      "bg-transparent border-ink-800 text-ink-950 hover:bg-bone-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[10px]",
    md: "px-5 py-2.5 text-xs",
    lg: "px-8 py-3.5 text-sm",
  };

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        disabled && "opacity-40 cursor-not-allowed",
        "notch-tr",
        className
      )}
      disabled={disabled}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </motion.button>
  );
}
