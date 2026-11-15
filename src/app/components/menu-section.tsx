"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

import { categories, dishes, type MenuCategory } from "@/data/menu";
import { cn } from "@/lib/utils";
import { DishCard } from "./dish-card";

type CategoryFilter = "all" | MenuCategory;

export function MenuSection() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return dishes.filter((dish) => {
      if (category !== "all" && dish.category !== category) return false;
      if (!needle) return true;
      return [dish.item_name, dish.item_desc, ...dish.tags]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [category, query]);

  return (
    <section id="menu" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-tomato-deep">
              The menu
            </p>
            <h2 className="mt-2 max-w-xl font-display text-[clamp(2.2rem,5.5vw,4.2rem)] font-semibold leading-[0.94] tracking-[-0.04em]">
              Order like you mean it.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
              Small plates for the middle of the table, big plates for the main event.
              Add what you like — the tray keeps score.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-cream-deep">
              <SlidersHorizontal aria-hidden="true" className="size-3.5" />
            </span>
            {filtered.length} dishes
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 mt-6 border-y border-line/70 bg-cream/90 backdrop-blur-xl sm:top-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2.5 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the menu…"
                aria-label="Search the menu"
                className="h-11 w-full rounded-full border border-line bg-cream pl-11 pr-10 text-sm text-ink placeholder:text-muted/70 focus:border-ink/30 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-cream-deep hover:text-ink"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              )}
            </div>
            <span className="hidden rounded-full border border-line px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted sm:inline">
              Fall 2026
            </span>
          </div>

          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
            {categories.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setCategory(entry.id)}
                aria-pressed={category === entry.id}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-2 text-[11px] font-bold transition-colors",
                  category === entry.id
                    ? "bg-ink text-cream"
                    : "text-muted hover:bg-cream-deep hover:text-ink",
                )}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-7 sm:px-6 sm:pb-20 lg:px-8">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {filtered.map((dish, index) => (
              <DishCard key={dish.item_id} dish={dish} priority={index < 4} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-line bg-cream-deep/40 px-6 py-16 text-center">
            <p className="font-display text-2xl font-semibold">Nothing matches that.</p>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Try a different search, or clear the filters and start again.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="mt-5 rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-cream"
            >
              Reset the menu
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-muted">
          Prices are confirmed at the table. Tax and tip are added at checkout.
        </p>
      </div>
    </section>
  );
}
