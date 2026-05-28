"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (
      (username === "admin" && password === "admin") ||
      (username === "sales" && password === "sales") ||
      (username === "finance" && password === "finance")
    ) {
      // Set simple cookies for auth and role
      document.cookie = `auth=true; path=/; max-age=86400`;
      document.cookie = `role=${username}; path=/; max-age=86400`;
      router.push("/");
      router.refresh(); // Force refresh to trigger middleware if needed
    } else {
      setError("Invalid username or password. Try admin/admin, sales/sales, or finance/finance.");
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7] px-4 py-12 sm:px-6 lg:px-8">
      {" "}
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl ring-1 ring-zinc-200">
        {" "}
        <div className="flex flex-col items-center text-center">
          {" "}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-400 text-white shadow-lg">
            {" "}
            <Activity className="h-6 w-6" />{" "}
          </div>{" "}
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-800">
            {" "}
            Welcome back{" "}
          </h2>{" "}
          <p className="mt-2 text-sm text-slate-500">
            {" "}
            Agency Finance & Billing Dashboard{" "}
          </p>{" "}
        </div>{" "}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {" "}
          <div className="space-y-4 rounded-md shadow-sm">
            {" "}
            <div>
              {" "}
              <label
                className="block text-sm font-medium text-slate-600"
                htmlFor="username"
              >
                {" "}
                Username{" "}
              </label>{" "}
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 placeholder-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition-all"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />{" "}
            </div>{" "}
            <div>
              {" "}
              <label
                className="block text-sm font-medium text-slate-600"
                htmlFor="password"
              >
                {" "}
                Password{" "}
              </label>{" "}
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 placeholder-zinc-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />{" "}
            </div>{" "}
          </div>{" "}
          {error && (
            <div className="text-sm font-medium text-red-500 bg-rose-50 p-3 rounded-lg border border-red-200 text-center">
              {" "}
              {error}{" "}
            </div>
          )}{" "}
          <div>
            {" "}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-violet-400 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 disabled:opacity-70"
            >
              {" "}
              {loading ? (
                <span className="flex items-center gap-2">
                  {" "}
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{" "}
                  Signing in...{" "}
                </span>
              ) : (
                "Sign in"
              )}{" "}
            </button>{" "}
          </div>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
}
