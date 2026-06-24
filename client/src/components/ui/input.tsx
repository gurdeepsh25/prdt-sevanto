"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm",
      "placeholder:text-slate-400",
      "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
