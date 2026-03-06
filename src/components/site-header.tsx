import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/search", label: "Trade-In Finder" },
  { href: "/sell-vs-trade", label: "Sell vs Trade" },
  { href: "/upgrade", label: "Upgrade" },
  { href: "/deals", label: "Deals" },
  { href: "/methodology", label: "Methodology" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-line/80 bg-panel/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-muted transition hover:text-foreground">{item.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link href="/search" className="rounded-full border border-line bg-accent px-3 py-2 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-accent-strong sm:px-4">Start search</Link>
        </div>
      </div>
      <div className="no-scrollbar overflow-x-auto border-t border-line/70 md:hidden">
        <div className="mx-auto flex max-w-7xl gap-2 px-4 py-3 sm:px-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-full border border-line bg-panel px-3 py-2 text-xs font-semibold text-muted transition hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
