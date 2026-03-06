import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
      <span className="pill rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-muted">
        Signal lost
      </span>
      <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
        This trade-in path does not exist.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        The device, merchant, or offer slug may be stale. Start from search to
        re-run the ranking engine against the current seeded dataset.
      </p>
      <Link
        href="/search"
        className="mt-8 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
      >
        Open trade-in finder
      </Link>
    </div>
  );
}
