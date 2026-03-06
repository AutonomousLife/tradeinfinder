import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

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
    <header className="relative z-20 border-b border-line/80 bg-panel/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="glow flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-[#3187ff] text-sm font-semibold text-slate-950">
            TF
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">TradeInFinder</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              Dark-first phone upgrade intelligence
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
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/search"
            className="rounded-full border border-line bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-accent-strong"
          >
            Start search
          </Link>
        </div>
      </div>
    </header>
  );
}

