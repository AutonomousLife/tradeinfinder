export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`brand-mark relative overflow-hidden rounded-[1rem] border border-line ${compact ? "h-11 w-11" : "h-12 w-12"}`}>
        <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="tradeinfinder-mark" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--accent)" />
              <stop offset="1" stopColor="#d0aa6e" />
            </linearGradient>
          </defs>
          <rect x="16" y="11" width="24" height="42" rx="8" fill="none" stroke="url(#tradeinfinder-mark)" strokeWidth="3.5" />
          <circle cx="28" cy="46" r="2.4" fill="url(#tradeinfinder-mark)" />
          <path d="M45 19c5 2 8 6 8 13s-3 11-8 13" fill="none" stroke="url(#tradeinfinder-mark)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M40 24c3 2 5 5 5 8s-2 6-5 8" fill="none" stroke="url(#tradeinfinder-mark)" strokeWidth="3.5" strokeLinecap="round" opacity="0.9" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold tracking-[0.01em] text-foreground">TradeInFinder</p>
        <p className="text-xs text-muted">Trade in, sell, or upgrade with less noise.</p>
      </div>
    </div>
  );
}
