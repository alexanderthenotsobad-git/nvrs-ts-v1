import { ArrowUpRight } from "lucide-react";

import { featuredDishes } from "@/data/menu";
import { DishCard } from "./dish-card";

export function FeaturedDishes() {
  return (
    <section className="border-b border-line/70 bg-cream-deep/45 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-tomato-deep">
              Tonight&apos;s short list
            </p>
            <h2 className="mt-2 max-w-xl font-display text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
              A few things we&apos;re proud of.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
              The menu moves with the market. These are the plates that tend to stay.
            </p>
          </div>
          <a
            href="#menu"
            className="hidden shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-tomato-deep hover:underline sm:inline-flex"
          >
            Full menu
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
        </div>

        <div className="no-scrollbar -mx-4 mt-7 flex snap-x gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
          {featuredDishes.map((dish, index) => (
            <DishCard
              key={dish.item_id}
              dish={dish}
              featured
              priority={index < 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
