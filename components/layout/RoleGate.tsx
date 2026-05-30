"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock, ArrowRight, ShieldAlert } from "lucide-react";

export default function RoleGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const getRole = () => {
      const match = document.cookie.match(/(?:^|; )role=([^;]*)/);
      return match ? decodeURIComponent(match[1]) : null;
    };
    setRole(getRole());
    setMounted(true);
  }, [pathname]);

  if (!mounted) {
    return <div className="flex-1" />;
  }

  // If role is sales and page is NOT invoices, render lock screen
  const isSales = role === "sales";
  const isLockedPage = pathname !== "/invoices";

  if (isSales && isLockedPage) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[70vh] p-4">
        <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white p-8 shadow-xl border border-slate-100 flex flex-col items-center text-center relative">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

          {/* Lock Icon Container */}
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-50 text-violet-500 shadow-inner">
            <div className="absolute inset-0 animate-ping rounded-2xl bg-violet-400/10 opacity-70" />
            <Lock className="h-10 w-10 relative z-10" />
          </div>

          {/* Text Details */}
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Page Locked
          </h2>
          <div className="mt-2 flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
            <ShieldAlert className="h-3.5 w-3.5" />
            Sales Account Access
          </div>
          <p className="mt-4 text-sm text-slate-500 max-w-sm leading-relaxed">
            Your sales account does not have permission to view this section. You are authorized to access the Invoices page to manage and generate invoices.
          </p>

          {/* Call to action button */}
          <button
            onClick={() => router.push("/invoices")}
            className="mt-8 group flex items-center gap-2 rounded-xl bg-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-violet-600 hover:shadow-violet-500/25 focus:outline-none"
          >
            Go to Invoices Page
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
