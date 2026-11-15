"use client";

import { ArrowRight, Plus, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { useOrderTray } from "@/context/OrderTrayContext";
import { dishes, formatPrice, type Dish } from "@/data/menu";
import { useToast } from "./toast";

const PROMPTS = [
  "High protein",
  "No shellfish",
  "Under 600 cal",
  "Vegetarian",
  "Something spicy",
];

function pickDish(query: string): Dish {
  const value = query.toLowerCase();
  if (value.includes("protein") || value.includes("salmon")) {
    return dishes.find((dish) => dish.item_id === 10) ?? dishes[0];
  }
  if (value.includes("vegetarian") || value.includes("veg")) {
    return dishes.find((dish) => dish.item_id === 8) ?? dishes[0];
  }
  if (value.includes("spicy") || value.includes("heat")) {
    return dishes.find((dish) => dish.item_id === 6) ?? dishes[0];
  }
  if (value.includes("light") || value.includes("salad")) {
    return dishes.find((dish) => dish.item_id === 1) ?? dishes[0];
  }
  if (value.includes("sweet") || value.includes("dessert")) {
    return dishes.find((dish) => dish.item_id === 15) ?? dishes[0];
  }
  return dishes.find((dish) => dish.item_id === 7) ?? dishes[0];
}

export function AIGuide() {
  const { addToOrder } = useOrderTray();
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<Dish>(
    dishes.find((dish) => dish.item_id === 10) ?? dishes[0],
  );
  const [why, setWhy] = useState(
    "A clean, bright plate with enough protein to carry the rest of the evening.",
  );

  function ask(value: string) {
    const next = value.trim();
    if (!next) return;
    const dish = pickDish(next);
    setAnswer(dish);
    setWhy(
      `Because you asked for “${next}”. ${dish.item_desc} It is the plate I would send to the table first.`,
    );
    setQuery(next);
  }

  function addAnswer() {
    addToOrder(answer, 1);
    push({
      title: `${answer.item_name} added`,
      description: "The nutritionist approves. Your tray is updated.",
    });
  }

  return (
    <section id="guide" className="scroll-mt-20 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[2rem] bg-olive text-cream shadow-lift lg:grid-cols-[1.02fr_0.98fr]">
          <div className="relative p-6 sm:p-10 lg:p-12">
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-20 size-56 rounded-full border border-cream/10"
            />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-butter-soft">
              The nutritionist
            </p>
            <h2 className="mt-3 max-w-lg font-display text-[clamp(2.15rem,5vw,3.8rem)] font-semibold leading-[0.96] tracking-[-0.04em]">
              Tell us how you want to feel.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-cream">
              Our menu guide reads ingredients, not just dish names. Ask for high
              protein, no shellfish, or something green — it will find a plate that
              fits.
            </p>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => ask(prompt)}
                  className="rounded-full border border-cream/20 bg-cream/5 px-3 py-1.5 text-[10px] font-bold text-cream transition-colors hover:bg-cream/10 hover:text-cream"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                ask(query);
              }}
              className="mt-5 flex items-center gap-2 rounded-full border border-cream/20 bg-ink/20 p-1.5 pl-4 backdrop-blur"
            >
              <Sparkles aria-hidden="true" className="size-4 shrink-0 text-butter" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="High protein, no shellfish, under 600 cal…"
                aria-label="Ask the menu guide"
                className="h-9 min-w-0 flex-1 bg-transparent text-sm text-cream placeholder:text-cream/70 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Ask the menu guide"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-butter text-ink transition-transform hover:scale-105"
              >
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            </form>

            <p className="mt-3 text-[10px] leading-relaxed text-cream">
              A demo recommendation. Always tell your server about an allergy.
            </p>
          </div>

          <div className="relative min-h-[22rem] border-t border-cream/10 lg:min-h-0 lg:border-l lg:border-t-0">
            <Image
              src={answer.image}
              alt={answer.item_name}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              loading="eager"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />

            <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6" aria-live="polite">
              <div className="rounded-[1.4rem] border border-white/10 bg-cream/95 p-4 text-ink shadow-lift backdrop-blur sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-olive">
                    Recommended for you
                  </span>
                  <span className="rounded-full bg-cream-deep px-2.5 py-1 text-[10px] font-bold">
                    {formatPrice(answer.price)}
                  </span>
                </div>
                <p className="mt-2 font-display text-xl font-semibold leading-tight">
                  {answer.item_name}
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted">
                  {why}
                </p>
                <button
                  type="button"
                  onClick={addAnswer}
                  className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-xs font-bold text-cream"
                >
                  <Plus aria-hidden="true" className="size-3.5" />
                  Add to tray
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
