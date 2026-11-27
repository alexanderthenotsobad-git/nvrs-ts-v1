"use client";

import { Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface AITriggerProps {
  onClick: () => void;
  variant?: "header" | "fab" | "mobile-tab";
  className?: string;
}

export function AITrigger({ onClick, variant = "header", className }: AITriggerProps) {
  const isFAB = variant === "fab";
  const isMobileTab = variant === "mobile-tab";

  if (isMobileTab) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-bold uppercase tracking-[0.08em]",
          className
        )}
      >
        <span className="relative">
          <MessageSquare aria-hidden="true" className="size-4" />
          <Sparkles className="absolute -right-1 -top-1 size-3 text-butter" />
        </span>
        Menu expert
      </button>
    );
  }

  if (isFAB) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Consult the menu expert"
        className={cn(
          "fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-olive text-cream shadow-lift transition-transform hover:scale-105 md:hidden",
          className
        )}
      >
        <Sparkles className="size-6" />
      </button>
    );
  }

  // Header variant (desktop)
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Consult the menu expert"
      className={cn(
        "hidden h-10 items-center gap-2 rounded-full bg-olive px-4 text-sm font-semibold text-cream shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-olive/90 sm:flex",
        className
      )}
    >
      <Sparkles aria-hidden="true" className="size-4" />
      <span>Menu expert</span>
    </button>
  );
}
