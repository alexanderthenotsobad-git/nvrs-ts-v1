import Image from "next/image";

import { cn } from "@/lib/utils";

export function VRSLogo({
  className,
  inverted = false,
  compact = false,
}: {
  className?: string;
  inverted?: boolean;
  compact?: boolean;
}) {
  return (
    <a
      href="#top"
      aria-label="VRS Kitchen & Bar — home"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="relative size-10 shrink-0 overflow-hidden rounded-[12px] border border-black/5 bg-[#f2bf8c] shadow-soft transition-transform duration-300 group-hover:-rotate-2 group-hover:scale-[1.04] sm:size-11">
        <Image
          src="/brand/vrs-icon.png"
          alt=""
          fill
          sizes="44px"
          priority
          className="object-cover"
        />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[21px] font-semibold tracking-[-0.025em]",
              inverted ? "text-cream" : "text-ink",
            )}
          >
            VRS
          </span>
          <span
            className={cn(
              "mt-1 text-[8px] font-bold tracking-[0.22em] uppercase",
              inverted ? "text-cream/70" : "text-muted",
            )}
          >
            Kitchen &amp; Bar
          </span>
        </span>
      )}
    </a>
  );
}
