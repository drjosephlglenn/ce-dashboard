"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#231F20] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <h1
            className="text-[#D7D3CD] text-3xl tracking-[0.25em] uppercase font-light"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            SIDELINE
          </h1>
          <p className="text-[#B9B6AF] text-sm mt-2 tracking-wide">
            by Joey Glenn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full bg-[#2C2828] text-[#D7D3CD] placeholder-[#6B6561] border border-[rgba(215,211,205,0.12)] rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:border-[#8FBDA3] focus:ring-1 focus:ring-[#8FBDA3] transition-colors"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6561] hover:text-[#B9B6AF] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-[#8FBDA3] hover:bg-[#7DAE92] text-[#1B1919] font-medium rounded-lg py-3 text-sm tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
