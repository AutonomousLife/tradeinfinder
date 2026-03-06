import Link from "next/link";

const navItems = [
  { href: "/search", label: "Search" },
  { href: "/upgrade", label: "Upgrade" },
  { href: "/arbitrage", label: "Arbitrage" },
  { href: "/deals", label: "Deals" },
  { href: "/methodology", label: "Methodology" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-line/80 bg-[#faf6ee]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1d433f] text-sm font-semibold text-white shadow-lg shadow-accent/20">
            TF
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">TradeInFinder</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              Phone upgrade intelligence
            </p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/search"
          className="rounded-full border border-line bg-white/60 px-4 py-2 text-sm font-semibold transition hover:bg-white"
        >
          Start search
        </Link>
      </div>
    </header>
  );
}
