import Link from "next/link";
import { KMark } from "@/components/ui/brand";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <KMark className="h-16 w-16" />
      <h1 className="mt-6 font-display text-5xl font-extrabold text-white">404</h1>
      <p className="mt-3 text-slate-400">Page not found under construction.</p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-ink transition hover:brightness-110"
      >
        Return to Home
      </Link>
    </div>
  );
}

