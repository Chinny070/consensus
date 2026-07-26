"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV_ITEMS } from "@/config/navigation";
import { WalletButton } from "@/components/wallet/WalletButton";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-bone-000/95 backdrop-blur-sm border-b-2 border-ink-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-ink-950 notch-tr flex items-center justify-center">
                <span className="text-acid-500 font-mono text-xs font-bold">
                  C
                </span>
              </div>
              <span className="font-display text-lg tracking-tight hidden sm:block">
                CONSENSUS
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors",
                    pathname === item.href
                      ? "text-ink-950 bg-acid-500 notch-tr font-bold"
                      : "text-ink-800 hover:text-ink-950"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
