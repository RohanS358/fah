"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Zap,
  TrendingUp,
  AlertCircle,
  Clock,
  Activity,
  CheckCircle,
  X,
} from "lucide-react";

interface MeterPanelProps {
  meterId: string;
}

const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_DJANGO_API_BASE || "http://127.0.0.1:9000";

export function MeterPanel({ meterId }: MeterPanelProps) {
  const [meterData, setMeterData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let activeController: AbortController | null = null;
    let cancelled = false;

    const loadMeterData = async () => {
      setIsLoading(true);
      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;

      try {
        const response = await fetch(`${getApiBaseUrl()}/api/dashboard/${meterId}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch meter data: ${response.status}`);
        }

        const data = await response.json();
        if (cancelled) return;
        setMeterData({
          id: data.id || meterId,
          location: data.location || `Meter at ${meterId}`,
          status: data.status || "inactive",
          currentConsumption: Number(data.currentConsumption ?? 0),
          predictedConsumption: Number(data.predictedConsumption ?? 0),
          lastError: Number(data.lastError ?? 0),
          mae: Number(data.mae ?? 0),
          modelVersion: data.modelVersion || "N/A",
          retrainProgress: Number(data.retrainProgress ?? 0),
          lastUpdated: data.lastUpdated || "--:--:--",
          dailyAverage: Number(data.dailyAverage ?? 0),
          peakLoad: Number(data.peakLoad ?? 0),
          efficiency: Number(data.efficiency ?? 0),
          alerts: Array.isArray(data.alerts) ? data.alerts : [],
          recentHistory: Array.isArray(data.recentHistory) ? data.recentHistory : [],
        });
      } catch {
        if (cancelled) return;
        setMeterData({
          id: meterId,
          location: `Meter at ${meterId}`,
          status: "inactive",
          currentConsumption: 0,
          predictedConsumption: 0,
          lastError: 0,
          mae: 0,
          modelVersion: "N/A",
          retrainProgress: 0,
          lastUpdated: "--:--:--",
          dailyAverage: 0,
          peakLoad: 0,
          efficiency: 0,
          alerts: [],
          recentHistory: [],
        });
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadMeterData();
    const intervalId = setInterval(loadMeterData, 10000);

    return () => {
      cancelled = true;
      activeController?.abort();
      clearInterval(intervalId);
    };
  }, [meterId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Loading meter data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-foreground/10">
        <h3 className="font-display text-lg mb-1">{meterData.id}</h3>
        <p className="text-xs text-muted-foreground">{meterData.location}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div
            className={`flex items-center gap-2 p-3 rounded-lg border ${
              meterData.status === "active"
                ? "bg-green-500/10 border-green-500/20"
                : "bg-slate-500/10 border-slate-500/20"
            }`}
          >
            {meterData.status === "active" ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-slate-600" />
            )}
            <span
              className={`text-sm font-medium ${
                meterData.status === "active" ? "text-green-700" : "text-slate-700"
              }`}
            >
              {meterData.status === "active" ? "Active & Monitoring" : "Inactive"}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Current Consumption
                </span>
                <span className="text-xs text-muted-foreground">kWh</span>
              </div>
              <div className="text-3xl font-display font-bold tracking-tight">
                {meterData.currentConsumption.toFixed(2)}
              </div>
              <div className="mt-2 w-full bg-foreground/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all"
                  style={{
                    width: `${(meterData.currentConsumption / 1) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-card/50 border border-foreground/10 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Predicted</p>
                <p className="text-xl font-display font-bold">
                  {meterData.predictedConsumption.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-card/50 border border-foreground/10 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Error (MAE)</p>
                <p className="text-xl font-display font-bold text-orange-600">
                  {meterData.mae.toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-3">Performance</p>

            <div className="flex items-center justify-between p-2 bg-foreground/5 rounded">
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Daily Average
              </span>
              <span className="text-sm font-medium">{meterData.dailyAverage.toFixed(2)} kWh</span>
            </div>

            <div className="flex items-center justify-between p-2 bg-foreground/5 rounded">
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Peak Load
              </span>
              <span className="text-sm font-medium">{meterData.peakLoad.toFixed(2)} kWh</span>
            </div>

            <div className="flex items-center justify-between p-2 bg-foreground/5 rounded">
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Efficiency
              </span>
              <span className="text-sm font-medium text-green-600">
                {meterData.efficiency.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between p-2 bg-foreground/5 rounded">
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Last Updated
              </span>
              <span className="text-sm font-mono">{meterData.lastUpdated}</span>
            </div>
          </div>

          <div className="p-3 bg-card/50 border border-foreground/10 rounded-lg space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Model Status</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Version: {meterData.modelVersion}</span>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Retrain Progress</span>
                  <span className="text-muted-foreground">{meterData.retrainProgress}%</span>
                </div>
                <div className="w-full bg-foreground/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all"
                    style={{ width: `${meterData.retrainProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {meterData.alerts.length > 0 && (
            <div className="p-3 bg-card/50 border border-foreground/10 rounded-lg space-y-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Alerts ({meterData.alerts.length})
              </p>
              <div className="space-y-2">
                {meterData.alerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-2 rounded text-xs ${
                      alert.type === "warning"
                        ? "bg-orange-500/10 text-orange-700 border border-orange-500/20"
                        : "bg-blue-500/10 text-blue-700 border border-blue-500/20"
                    }`}
                  >
                    {alert.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-card/50 border border-foreground/10 rounded-lg space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-3">Recent History (5H)</p>
            <div className="space-y-1">
              {meterData.recentHistory.map((entry: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{entry.time}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{entry.consumption.toFixed(2)}</span>
                    <span className="text-muted-foreground text-[10px]">
                      → {entry.predicted.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
