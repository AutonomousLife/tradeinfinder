import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto flex max-w-7xl flex-col px-6", className)}>
      {children}
    </div>
  );
}
