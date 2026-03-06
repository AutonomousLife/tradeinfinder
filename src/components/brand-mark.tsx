export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`brand-mark relative overflow-hidden rounded-[1.15rem] border border-line/80 ${compact ? "h-11 w-11" : "h-12 w-12"}`}>
        <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="tradeinfinder-mark" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--accent)" />
              <stop offset="1" stopColor="#7f93ff" />
            </linearGradient>
          </defs>
          <rect x="15" y="10" width="24" height="44" rx="8" fill="none" stroke="url(#tradeinfinder-mark)" strokeWidth="4" />
          <circle cx="27" cy="47" r="2.5" fill="url(#tradeinfinder-mark)" />
          <path d="M45 18c5 2 8 7 8 14s-3 12-8 14" fill="none" stroke="url(#tradeinfinder-mark)" strokeWidth="4" strokeLinecap="round" />
          <path d="M40 23c3 2 5 5 5 9s-2 7-5 9" fill="none" stroke="url(#tradeinfinder-mark)" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold tracking-tight text-foreground">TradeInFinder</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Clear phone value intelligence</p>
      </div>
    </div>
  );
}
