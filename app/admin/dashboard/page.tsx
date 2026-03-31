"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardNav } from "@/components/admin/dashboard-nav";
import { GridMap } from "@/components/admin/grid-map";
import { MeterPanel } from "@/components/admin/meter-panel";
import { QuickStats } from "@/components/admin/quick-stats";
import { AlertCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedMeterId, setSelectedMeterId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState(0);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router will redirect to /admin/login
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
        {[...Array(16)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{
              top: `${6.25 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(24)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{
              left: `${4.166 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>

      {/* Top Navigation Bar */}
      <div className="relative z-20 border-b border-foreground/10 bg-background/80 backdrop-blur-sm">
        <div className="max-w-full px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-display">Bijulibatti</span>
            <span className="text-xs text-muted-foreground font-mono">Admin</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Alerts */}
            <button className="relative p-2 hover:bg-foreground/5 rounded-lg transition-colors">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
              {alerts > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
              )}
            </button>

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2 border-foreground/20 hover:bg-foreground/5"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Navigation */}
        <div className="hidden lg:flex lg:w-64 border-r border-foreground/10 bg-card/30 backdrop-blur-sm flex-col">
          <DashboardNav selectedMeterId={selectedMeterId} onSelectMeter={setSelectedMeterId} />
        </div>

        {/* Center - Map Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 lg:p-6 overflow-hidden">
          {/* Map */}
          <div className="flex-1 rounded-xl border border-foreground/10 bg-card/20 backdrop-blur-sm overflow-hidden">
            <GridMap selectedMeterId={selectedMeterId} onSelectMeter={setSelectedMeterId} />
          </div>

          {/* Right Panel - Meter Details */}
          {selectedMeterId && (
            <div className="w-full lg:w-96 rounded-xl border border-foreground/10 bg-card/20 backdrop-blur-sm overflow-hidden flex flex-col">
              <MeterPanel meterId={selectedMeterId} />
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-foreground/10 bg-background/80 backdrop-blur-sm">
        <QuickStats onAlertsChange={setAlerts} />
      </div>

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />
    </div>
  );
}
