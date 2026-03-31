"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Zap,
  Server,
  PieChart,
} from "lucide-react";

interface QuickStatsProps {
  onAlertsChange?: (alerts: number) => void;
}

const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_DJANGO_API_BASE || "http://127.0.0.1:9000";

export function QuickStats({ onAlertsChange }: QuickStatsProps) {
  const [stats, setStats] = useState({
    totalMeters: 0,
    activeMeters: 0,
    totalConsumption: 0,
    peakDemand: 0,
    averageEfficiency: 0,
    systemHealth: 0,
    alerts: 0,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let activeController: AbortController | null = null;
    let cancelled = false;

    const loadStats = async (silent = false) => {
      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;

      try {
        const response = await fetch(`${getApiBaseUrl()}/api/admin/meters`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch meters: ${response.status}`);
        }

        const data = await response.json();
        const meters = Array.isArray(data.meters) ? data.meters : [];

        const totalMeters = meters.length;
        const activeMeters = meters.filter((meter: any) => meter.status === "active").length;
        const totalConsumption = meters.reduce(
          (acc: number, meter: any) => acc + Number(meter.current_value ?? 0),
          0
        );
        const peakDemand = meters.reduce(
          (acc: number, meter: any) => Math.max(acc, Number(meter.current_value ?? 0)),
          0
        );
        const alerts = meters.reduce(
          (acc: number, meter: any) => acc + Number(meter.alerts ?? 0),
          0
        );
        const averageEfficiency =
          totalMeters > 0
            ? (activeMeters / totalMeters) * 100 - Math.min(alerts * 1.5, 20)
            : 0;
        const systemHealth =
          totalMeters > 0
            ? Math.max(0, Math.min(100, (activeMeters / totalMeters) * 100 - alerts * 2))
            : 0;

        if (cancelled) return;
        setStats({
          totalMeters,
          activeMeters,
          totalConsumption,
          peakDemand,
          averageEfficiency: Math.max(0, averageEfficiency),
          systemHealth,
          alerts,
        });
        onAlertsChange?.(alerts);
      } catch (error) {
        if ((error as Error).name === "AbortError" || cancelled) return;
        if (!silent) {
          setStats((prev) => ({ ...prev, alerts: 0 }));
          onAlertsChange?.(0);
        }
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    };

    loadStats();
    const interval = setInterval(() => loadStats(true), 10000);

    return () => {
      cancelled = true;
      activeController?.abort();
      clearInterval(interval);
    };
  }, [onAlertsChange]);

  return (
    <div className="max-w-full px-6 lg:px-8 py-4 flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-3 min-w-fit px-4 py-2 rounded-lg bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-colors">
        <Server className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">Meters</p>
          <p className="text-sm font-medium">
            {stats.activeMeters}/{stats.totalMeters}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 min-w-fit px-4 py-2 rounded-lg bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-colors">
        <Zap className="w-4 h-4 text-green-600" />
        <div>
          <p className="text-xs text-muted-foreground">Consumption</p>
          <p className="text-sm font-medium">{stats.totalConsumption.toFixed(2)} kWh</p>
        </div>
      </div>

      <div className="flex items-center gap-3 min-w-fit px-4 py-2 rounded-lg bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-colors">
        <TrendingUp className="w-4 h-4 text-orange-600" />
        <div>
          <p className="text-xs text-muted-foreground">Peak Demand</p>
          <p className="text-sm font-medium">{stats.peakDemand.toFixed(2)} kWh</p>
        </div>
      </div>

      <div className="flex items-center gap-3 min-w-fit px-4 py-2 rounded-lg bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-colors">
        <PieChart className="w-4 h-4 text-blue-600" />
        <div>
          <p className="text-xs text-muted-foreground">Efficiency</p>
          <p className="text-sm font-medium">{stats.averageEfficiency.toFixed(1)}%</p>
        </div>
      </div>

      <div className="flex items-center gap-3 min-w-fit px-4 py-2 rounded-lg bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 transition-colors">
        <Activity className="w-4 h-4 text-green-600" />
        <div>
          <p className="text-xs text-muted-foreground">Health</p>
          <p className="text-sm font-medium">{stats.systemHealth.toFixed(0)}%</p>
        </div>
      </div>

      <div className="flex items-center gap-3 min-w-fit px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-colors">
        <AlertTriangle className="w-4 h-4 text-orange-600" />
        <div>
          <p className="text-xs text-muted-foreground">Alerts</p>
          <p className="text-sm font-medium text-orange-600">{loaded ? stats.alerts : "--"}</p>
        </div>
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
