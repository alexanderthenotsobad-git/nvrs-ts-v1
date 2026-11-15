"use client";

import Image from "next/image";
import { Check, Plus, Star } from "lucide-react";
import { useState } from "react";

import { useOrderTray } from "@/context/OrderTrayContext";
import type { Dish } from "@/data/menu";
import { cn, formatCurrency } from "@/lib/utils";
import { useToast } from "./toast";

export function DishCard({
  dish,
  featured = false,
  priority = false,
  className,
}: {
  dish: Dish;
  featured?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const { addToOrder, getItemQuantity } = useOrderTray();
  const { push } = useToast();
  const [justAdded, setJustAdded] = useState(false);
  const quantity = getItemQuantity(dish.item_id);

  function add() {
    addToOrder(dish, 1);
    setJustAdded(true);
    push({
      title: `${dish.item_name} added`,
      description: "Your tray is waiting at the bottom of the screen.",
    });
    window.setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <article
      className={cn(
        "group flex min-w-0 flex-col",
        featured && "w-[17rem] shrink-0 snap-start sm:w-[19rem] md:w-auto md:min-w-0 md:shrink",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.35rem] bg-cream-deep",
          featured ? "aspect-[4/5]" : "aspect-[4/3]",
        )}
      >
        <Image
          src={dish.image}
          alt={dish.item_name}
          fill
          priority={priority}
          sizes={
            featured
              ? "(min-width: 1024px) 19rem, 17rem"
              : "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          }
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent opacity-80" />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {dish.badge ? (
            <span className="rounded-full bg-cream/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-ink shadow-soft backdrop-blur">
              {dish.badge}
            </span>
          ) : (
            <span />
          )}
          {dish.rating && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink/50 px-2 py-1 text-[10px] font-bold text-cream backdrop-blur">
              <Star aria-hidden="true" className="size-2.5 fill-butter text-butter" />
              {dish.rating}
            </span>
          )}
        </div>

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          <span className="rounded-full bg-cream/95 px-3 py-1.5 text-sm font-bold text-ink shadow-soft backdrop-blur">
            {formatCurrency(dish.price)}
          </span>
          <button
            type="button"
            onClick={add}
            aria-label={`Add ${dish.item_name} to tray`}
            className={cn(
              "relative flex size-11 shrink-0 items-center justify-center rounded-full shadow-lift transition-all duration-200",
              justAdded
                ? "bg-olive text-cream"
                : "bg-cream text-ink hover:scale-105 hover:bg-butter",
            )}
          >
            {justAdded ? (
              <Check aria-hidden="true" className="size-4" />
            ) : (
              <Plus aria-hidden="true" className="size-4" />
            )}
            {quantity > 0 && !justAdded && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-butter text-[9px] font-black text-ink">
                {quantity}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-0.5 pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[1.02rem] font-semibold leading-tight tracking-[-0.02em] sm:text-[1.15rem]">
            {dish.item_name}
          </h3>
        </div>
        <p
          className={cn(
            "mt-1 text-[11px] leading-relaxed text-muted sm:text-xs",
            featured ? "line-clamp-2" : "line-clamp-2",
          )}
        >
          {dish.item_desc}
        </p>
        {dish.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {dish.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line bg-cream-deep/60 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
