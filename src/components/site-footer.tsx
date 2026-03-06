import Link from "next/link";

const footerLinks = [
  { href: "/search", label: "Trade-in finder" },
  { href: "/upgrade", label: "Upgrade optimizer" },
  { href: "/arbitrage", label: "Arbitrage finder" },
  { href: "/deals", label: "Deals" },
  { href: "/admin", label: "Admin" },
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-line bg-[#f7f2e8]/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xl font-semibold tracking-tight">TradeInFinder</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Real trade-in optimization for people who care about effective value,
            bill-credit drag, merchant trust, and the actual cost to upgrade.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 md:justify-end">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
