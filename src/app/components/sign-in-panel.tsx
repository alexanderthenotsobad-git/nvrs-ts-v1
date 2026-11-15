"use client";

import {
  Apple,
  ArrowRight,
  Chrome,
  ConciergeBell,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useEffect } from "react";

import { useUserRole, type UserRole } from "@/context/UserContext";
import { useToast } from "./toast";

const OPTIONS: Array<{
  role: Exclude<UserRole, "none">;
  title: string;
  description: string;
  icon: typeof UserRound;
  accent: string;
}> = [
  {
    role: "patron",
    title: "Continue as a guest",
    description: "Browse, build a tray, and order at the table. No account required.",
    icon: UserRound,
    accent: "bg-butter-soft text-ink",
  },
  {
    role: "staff",
    title: "Staff demo",
    description: "Preview the service floor, live tickets, and table handoff.",
    icon: ConciergeBell,
    accent: "bg-olive-soft text-olive",
  },
  {
    role: "admin",
    title: "Manager demo",
    description: "Preview menu controls, availability, and the manager view.",
    icon: ShieldCheck,
    accent: "bg-tomato-soft text-tomato-deep",
  },
];

export function SignInPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, signIn, signOut } = useUserRole();
  const { push } = useToast();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function choose(role: Exclude<UserRole, "none">, label: string) {
    signIn(role);
    onClose();
    push({
      title: label,
      description:
        role === "patron"
          ? "Your tray and table session are ready."
          : "This is a visual demo — no real staff permissions are granted.",
    });
  }

  return (
    <div className="fixed inset-x-3 top-24 z-50 sm:left-auto sm:right-6 sm:w-[24rem]">
      <div
        role="dialog"
        aria-label="Sign in to VRS"
        className="max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-[1.75rem] border border-line bg-cream shadow-lift"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line/80 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-tomato-deep">
              VRS account
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]">
              {user ? "You’re in." : "Pull up a chair."}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-cream-deep hover:text-ink"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        <div className="p-4">
          {user ? (
            <div className="rounded-2xl bg-cream-deep p-4">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="mt-0.5 text-xs capitalize text-muted">{user.role} demo</p>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  onClose();
                  push({ title: "Signed out", description: "The table is still yours." });
                }}
                className="mt-4 text-xs font-semibold text-tomato-deep"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <p className="px-1 pb-3 text-xs leading-relaxed text-muted">
                This is a visual demo. Pick a view to explore — no password, no real
                account, no spam.
              </p>

              <div className="grid gap-2">
                {OPTIONS.map((option) => (
                  <button
                    key={option.role}
                    type="button"
                    onClick={() => choose(option.role, option.title)}
                    className="group flex items-center gap-3 rounded-2xl border border-line bg-cream p-3 text-left transition-colors hover:border-ink/20 hover:bg-cream-deep"
                  >
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${option.accent}`}
                    >
                      <option.icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{option.title}</span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
                        {option.description}
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                    />
                  </button>
                ))}
              </div>

              <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                  or use a demo account
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => choose("patron", "Signed in with Apple")}
                  className="flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-cream text-xs font-semibold transition-colors hover:bg-cream-deep"
                >
                  <Apple aria-hidden="true" className="size-4" />
                  Apple
                </button>
                <button
                  type="button"
                  onClick={() => choose("patron", "Signed in with Google")}
                  className="flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-cream text-xs font-semibold transition-colors hover:bg-cream-deep"
                >
                  <Chrome aria-hidden="true" className="size-4" />
                  Google
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
