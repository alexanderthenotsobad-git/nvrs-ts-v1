const WORDS = [
  "Seasonal menu",
  "Wood-fired",
  "Hand-rolled pasta",
  "Natural wine",
  "No app required",
  "Table-side payment",
  "Open late",
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center"
    >
      {WORDS.map((word) => (
        <span
          key={word}
          className="mx-5 inline-flex items-center gap-5 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap sm:mx-7"
        >
          {word}
          <span aria-hidden="true" className="text-butter">
            ✦
          </span>
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="overflow-hidden border-y border-cream/10 bg-ink py-3 text-cream/80">
      <div className="flex w-max animate-marquee">
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}
