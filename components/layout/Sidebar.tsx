"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  FileText,
  Users,
  Repeat,
  Package,
  BarChart3,
  Settings,
  Activity,
  LogOut,
  Bot,
  Briefcase,
  Wallet,
  Lock
} from "lucide-react";
import { useRouter } from "next/navigation";
const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Employees", href: "/employees", icon: Briefcase },
  { name: "Payroll", href: "/payroll", icon: Wallet },
  { name: "Recurring", href: "/recurring", icon: Repeat },
  { name: "Packages", href: "/packages", icon: Package },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "AI Chat", href: "/ai-chat", icon: Bot },
  { name: "Settings", href: "/settings", icon: Settings },
];
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const getRole = () => {
      const match = document.cookie.match(/(?:^|; )role=([^;]*)/);
      return match ? decodeURIComponent(match[1]) : null;
    };
    setRole(getRole());
  }, []);

  const handleLogout = () => {
    document.cookie = "auth=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    router.push("/login");
    router.refresh();
  };
  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {" "}
      <div className="flex h-16 items-center gap-3 px-6 py-4">
        {" "}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-400 text-white shadow-sm">
          {" "}
          <Activity className="h-5 w-5" />{" "}
        </div>{" "}
        <span className="text-lg font-bold text-slate-800">
          Askus Studio
        </span>{" "}
      </div>{" "}
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
        {" "}
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const isItemLocked = role === "sales" && item.href !== "/invoices";
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-100 text-violet-500"
                  : "text-slate-500 hover:bg-[#fdfbf7] hover:text-slate-800",
              )}
            >
              {" "}
              <item.icon
                className={clsx(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-violet-500"
                    : "text-slate-400 group-hover:text-slate-500",
                )}
              />{" "}
              <span className="flex-1">{item.name}</span>{" "}
              {isItemLocked && (
                <Lock className="h-3.5 w-3.5 text-slate-300 group-hover:text-violet-400 transition-colors shrink-0" />
              )}
            </Link>
          );
        })}{" "}
      </nav>{" "}
      <div className="border-t border-slate-200 p-4">
        {" "}
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-500"
        >
          {" "}
          <LogOut className="h-5 w-5 shrink-0 text-slate-400 transition-colors group-hover:text-rose-500" />{" "}
          Sign out{" "}
        </button>{" "}
      </div>{" "}
    </div>
  );
}
