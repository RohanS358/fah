"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { AnimatedSphere } from "@/components/landing/animated-sphere";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      if (username === "admin" && password === "admin") {
        localStorage.setItem("admin_authenticated", "true");
        localStorage.setItem("admin_token", "demo-token");
        router.push("/admin/dashboard");
      } else {
        setError("Invalid credentials. Use admin/admin for demo.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Animated sphere background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] opacity-30 pointer-events-none">
        <AnimatedSphere />
      </div>

      {/* Grid lines background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{
              left: `${8.33 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>

      {/* Login Form Container */}
      <div className="relative z-10 w-full max-w-md px-6 lg:px-8">
        <div
          className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Header */}
          <div className="mb-12 text-center">
            <a href="/" className="inline-block mb-8">
              <span className="text-3xl lg:text-4xl font-display tracking-tight">
                Bijulibatti
              </span>
              <span className="text-xs text-muted-foreground font-mono ml-2">v1</span>
            </a>
            <h1 className="text-4xl lg:text-5xl font-display tracking-tight mb-4">
              Grid Control
            </h1>
            <p className="text-muted-foreground text-lg">
              Monitor and manage your smart grid in real-time
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-card/50 backdrop-blur-sm border border-foreground/10 rounded-2xl p-8 lg:p-10">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-sm font-medium text-foreground block"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 bg-background/50 border border-foreground/20 rounded-lg focus:outline-none focus:border-foreground/50 focus:ring-1 focus:ring-foreground/20 text-foreground placeholder:text-muted-foreground transition-all"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground block"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-background/50 border border-foreground/20 rounded-lg focus:outline-none focus:border-foreground/50 focus:ring-1 focus:ring-foreground/20 text-foreground placeholder:text-muted-foreground transition-all pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-foreground hover:bg-foreground/90 text-background px-6 h-12 text-base rounded-lg group font-medium transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-8 border-t border-foreground/10">
              <p className="text-xs text-muted-foreground text-center mb-4">
                Demo Credentials
              </p>
              <div className="space-y-2 text-xs font-mono text-muted-foreground">
                <p className="text-center">
                  Username: <span className="text-foreground">admin</span>
                </p>
                <p className="text-center">
                  Password: <span className="text-foreground">admin</span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer Link */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Go back to{" "}
            <a
              href="/"
              className="text-foreground hover:underline transition-colors"
            >
              landing page
            </a>
          </p>
        </div>
      </div>

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />
    </div>
  );
}
