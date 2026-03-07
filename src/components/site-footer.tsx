import Link from "next/link";

const footerLinks = [
  { href: "/search", label: "Search" },
  { href: "/sell-vs-trade", label: "Sell vs Trade" },
  { href: "/upgrade", label: "Upgrade" },
  { href: "/deals", label: "Deals" },
  { href: "/methodology", label: "Methodology" },
  { href: "/admin", label: "Admin" },
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-line bg-background/94">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xl font-semibold tracking-tight">TradeInFinder</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">A quieter, more practical way to compare direct trade-in value, resale value, and simple upgrade cost.</p>
          <p className="mt-4 max-w-2xl text-xs leading-6 text-muted">Some values are estimated. Rankings favor usable value, confidence, and simplicity. Affiliate support never determines rank order.</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-3 md:justify-end">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-muted transition hover:text-foreground">{item.label}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
