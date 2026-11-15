"use client";

import {
  ArrowLeft,
  Banknote,
  Check,
  ChevronRight,
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useOrderTray } from "@/context/OrderTrayContext";
import { useUserRole } from "@/context/UserContext";
import { cn, formatCurrency, initials } from "@/lib/utils";
import { useToast } from "./toast";

type Step = "tray" | "checkout" | "success";
type PaymentMethod = "apple" | "card" | "cash";

const TIPS = [0, 18, 20, 25];
const TAX_RATE = 0.0875;

export function TrayDrawer() {
  const {
    orderItems,
    isOrderTrayOpen,
    closeOrderTray,
    updateQuantity,
    removeFromOrder,
    clearOrder,
    getTotalPrice,
    getTotalItems,
  } = useOrderTray();
  const { user } = useUserRole();
  const { push } = useToast();

  const [step, setStep] = useState<Step>("tray");
  const [tipPercent, setTipPercent] = useState(20);
  const [payment, setPayment] = useState<PaymentMethod>("apple");
  const [success, setSuccess] = useState<{ number: string; total: number } | null>(
    null,
  );

  const subtotal = getTotalPrice();
  const tax = subtotal * TAX_RATE;
  const tip = (subtotal * tipPercent) / 100;
  const total = subtotal + tax + tip;
  const count = getTotalItems();

  useEffect(() => {
    if (!isOrderTrayOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
    // close is stable enough for this demo; the drawer is the only consumer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOrderTrayOpen]);

  if (!isOrderTrayOpen) return null;

  function close() {
    setStep("tray");
    setSuccess(null);
    setTipPercent(20);
    setPayment("apple");
    closeOrderTray();
  }

  function placeOrder() {
    if (count === 0) return;
    const number = `VRS-${Math.floor(1000 + Math.random() * 9000)}`;
    setSuccess({ number, total });
    setStep("success");
    clearOrder();
    push({
      title: "Order sent to the kitchen",
      description: "This is a demo. No payment was taken.",
    });
  }

  const title =
    step === "checkout" ? "Checkout" : step === "success" ? "Order sent" : "Your tray";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tray-title"
      className="fixed inset-0 z-[60]"
    >
      <button
        type="button"
        aria-label="Close tray"
        onClick={close}
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
      />

      <div className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[2rem] bg-cream shadow-lift md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-[430px] md:rounded-none">
        <div className="safe-bottom shrink-0 border-b border-line bg-cream/95 px-4 pb-2 pt-2 backdrop-blur sm:px-5">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-line md:hidden" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {step === "checkout" && (
                <button
                  type="button"
                  onClick={() => setStep("tray")}
                  aria-label="Back to tray"
                  className="flex size-10 items-center justify-center rounded-full text-muted hover:bg-cream-deep hover:text-ink"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                </button>
              )}
              <div>
                <h2
                  id="tray-title"
                  className="font-display text-2xl font-semibold tracking-[-0.03em]"
                >
                  {title}
                </h2>
                {step !== "success" && (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                    {count} {count === 1 ? "item" : "items"} · Table 12
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close tray"
              className="flex size-10 items-center justify-center rounded-full text-muted hover:bg-cream-deep hover:text-ink"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {step === "success" && success ? (
            <div className="flex min-h-full flex-col items-center justify-center px-6 py-14 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-olive-soft text-olive">
                <Check aria-hidden="true" className="size-7" />
              </span>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-olive">
                Ticket {success.number}
              </p>
              <h3 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em]">
                It&apos;s in.
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
                The kitchen has your order. This is a demo, so no payment was taken and
                no one is actually cooking — but it would look a lot like this.
              </p>
              <div className="mt-5 rounded-2xl border border-line bg-cream-deep/60 px-5 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                  Demo total
                </p>
                <p className="mt-0.5 font-display text-3xl font-semibold">
                  {formatCurrency(success.total)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  close();
                  window.location.hash = "#menu";
                }}
                className="mt-7 flex h-12 w-full max-w-xs items-center justify-center rounded-full bg-ink px-5 text-sm font-bold text-cream"
              >
                Back to the menu
              </button>
            </div>
          ) : orderItems.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center px-6 py-14 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-cream-deep text-muted">
                <ShoppingBag aria-hidden="true" className="size-6" />
              </span>
              <h3 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em]">
                Nothing in here yet.
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
                Start with something small, or go straight for the cacio e pepe. The
                tray will wait.
              </p>
              <button
                type="button"
                onClick={() => {
                  close();
                  window.location.hash = "#menu";
                }}
                className="mt-6 flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-bold text-cream"
              >
                Browse the menu
              </button>
            </div>
          ) : (
            <div className="px-4 py-4 sm:px-5">
              <ul className="divide-y divide-line/70">
                {orderItems.map((item) => (
                  <li key={item.item_id} className="flex gap-3 py-4 first:pt-1">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] font-bold text-muted">
                          VRS
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{item.item_name}</p>
                          <p className="mt-0.5 text-[11px] text-muted">
                            {formatCurrency(item.price)} each
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromOrder(item.item_id)}
                          aria-label={`Remove ${item.item_name}`}
                          className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-tomato-soft hover:text-tomato-deep"
                        >
                          <Trash2 aria-hidden="true" className="size-3.5" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-line bg-cream">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.item_id, item.quantity - 1)
                            }
                            aria-label={`Decrease ${item.item_name}`}
                            className="flex size-10 items-center justify-center rounded-full text-muted hover:bg-cream-deep hover:text-ink"
                          >
                            <Minus aria-hidden="true" className="size-3" />
                          </button>
                          <span className="min-w-5 text-center text-xs font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.item_id, item.quantity + 1)
                            }
                            aria-label={`Increase ${item.item_name}`}
                            className="flex size-10 items-center justify-center rounded-full text-muted hover:bg-cream-deep hover:text-ink"
                          >
                            <Plus aria-hidden="true" className="size-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold tabular-nums">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {step === "checkout" && (
                <div className="mt-6 space-y-5 border-t border-line pt-5">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl font-semibold">Add a tip</h3>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                        For the room
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-1.5">
                      {TIPS.map((percent) => (
                        <button
                          key={percent}
                          type="button"
                          onClick={() => setTipPercent(percent)}
                          className={cn(
                            "flex h-11 flex-col items-center justify-center rounded-xl border text-[11px] font-bold transition-colors",
                            tipPercent === percent
                              ? "border-ink bg-ink text-cream"
                              : "border-line bg-cream text-muted hover:border-ink/20",
                          )}
                        >
                          {percent === 0 ? "None" : `${percent}%`}
                          <span
                            className={cn(
                              "mt-0.5 text-[9px] font-medium",
                              tipPercent === percent
                                ? "text-cream/70"
                                : "text-muted/70",
                            )}
                          >
                            {percent === 0
                              ? "$0"
                              : formatCurrency((subtotal * percent) / 100)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-semibold">Pay with</h3>
                    <div className="mt-2 grid gap-1.5">
                      {[
                        {
                          id: "apple" as const,
                          label: "Apple Pay",
                          note: "Demo · instant",
                          icon: Smartphone,
                        },
                        {
                          id: "card" as const,
                          label: "Card at the table",
                          note: "Demo · no card details",
                          icon: CreditCard,
                        },
                        {
                          id: "cash" as const,
                          label: "Cash",
                          note: "Pay your server",
                          icon: Banknote,
                        },
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPayment(method.id)}
                          className={cn(
                            "flex h-12 items-center gap-3 rounded-xl border px-3 text-left transition-colors",
                            payment === method.id
                              ? "border-ink bg-cream-deep"
                              : "border-line bg-cream hover:border-ink/20",
                          )}
                        >
                          <method.icon aria-hidden="true" className="size-4" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-bold">{method.label}</span>
                            <span className="block text-[10px] text-muted">{method.note}</span>
                          </span>
                          <span
                            className={cn(
                              "flex size-4 items-center justify-center rounded-full border",
                              payment === method.id
                                ? "border-ink bg-ink text-cream"
                                : "border-line",
                            )}
                          >
                            {payment === method.id && (
                              <Check aria-hidden="true" className="size-2.5" />
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-cream-deep/60 p-4">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>Subtotal</span>
                      <span className="tabular-nums">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs text-muted">
                      <span>Tax</span>
                      <span className="tabular-nums">{formatCurrency(tax)}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs text-muted">
                      <span>Tip · {tipPercent}%</span>
                      <span className="tabular-nums">{formatCurrency(tip)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-3">
                      <span className="text-sm font-bold">Total</span>
                      <span className="font-display text-2xl font-semibold tabular-nums">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>

                  <p className="text-center text-[10px] leading-relaxed text-muted">
                    Demo checkout. No payment method is charged and no card details are
                    collected.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {step !== "success" && orderItems.length > 0 && (
          <div className="safe-bottom shrink-0 border-t border-line bg-cream px-4 pb-3 pt-3 sm:px-5">
            {user ? (
              <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold text-muted">
                <span className="flex size-5 items-center justify-center rounded-full bg-olive-soft text-[7px] font-black text-olive">
                  {initials(user.name)}
                </span>
                {step === "checkout" ? `Ordering as ${user.name}` : "Signed in"}
                <span className="ml-auto inline-flex items-center gap-1 text-olive">
                  <Check aria-hidden="true" className="size-3" />
                  Table 12
                </span>
              </div>
            ) : (
              <p className="mb-2 text-[10px] font-semibold text-muted">
                Guest checkout · no account needed
              </p>
            )}

            {step === "tray" ? (
              <>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-bold tabular-nums">{formatCurrency(subtotal)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("checkout")}
                  className="flex h-12 w-full items-center justify-between rounded-full bg-ink px-5 text-sm font-bold text-cream"
                >
                  <span>Checkout</span>
                  <span className="flex items-center gap-1 tabular-nums">
                    {formatCurrency(subtotal + tax)}
                    <ChevronRight aria-hidden="true" className="size-4" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={clearOrder}
                  className="mt-1 w-full py-2 text-[10px] font-semibold text-muted hover:text-tomato-deep"
                >
                  Clear tray
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={placeOrder}
                className="flex h-12 w-full items-center justify-between rounded-full bg-tomato px-5 text-sm font-bold text-cream transition-colors hover:bg-tomato-deep"
              >
                <span>
                  {payment === "cash" ? "Send to the table" : "Place demo order"}
                </span>
                <span className="tabular-nums">{formatCurrency(total)}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
