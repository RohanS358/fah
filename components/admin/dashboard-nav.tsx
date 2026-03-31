"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, AlertCircle, Power } from "lucide-react";

interface DashboardNavProps {
  selectedMeterId: string | null;
  onSelectMeter: (meterId: string) => void;
}

export function DashboardNav({ selectedMeterId, onSelectMeter }: DashboardNavProps) {
  const [meters, setMeters] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call to /api/admin/meters
    const mockMeters = [
      {
        id: "M001",
        location: "Kathmandu Central",
        status: "active",
        consumption: 0.45,
        alerts: 0,
      },
      {
        id: "M002",
        location: "Pokhara West",
        status: "active",
        consumption: 0.38,
        alerts: 2,
      },
      {
        id: "M003",
        location: "Biratnagar East",
        status: "active",
        consumption: 0.52,
        alerts: 1,
      },
      {
        id: "M004",
        location: "Janakpur North",
        status: "inactive",
        consumption: 0.0,
        alerts: 0,
      },
      {
        id: "M005",
        location: "Dhanbad South",
        status: "active",
        consumption: 0.41,
        alerts: 0,
      },
      {
        id: "M006",
        location: "Kathmandu East",
        status: "active",
        consumption: 0.39,
        alerts: 3,
      },
    ];

    setMeters(mockMeters);
    setIsLoading(false);
  }, []);

  const filteredMeters = meters.filter(
    (meter) =>
      meter.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meter.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-foreground/10">
        <h2 className="text-lg font-display mb-4">Smart Meters</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search meters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background/50 border border-foreground/20 rounded-lg text-sm focus:outline-none focus:border-foreground/50 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Meters List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredMeters.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No meters found
            </p>
          ) : (
            filteredMeters.map((meter) => (
              <button
                key={meter.id}
                onClick={() => onSelectMeter(meter.id)}
                className={`w-full text-left p-3 rounded-lg transition-all border ${
                  selectedMeterId === meter.id
                    ? "bg-foreground/10 border-foreground/30"
                    : "bg-transparent border-foreground/10 hover:bg-foreground/5"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{meter.id}</p>
                    <p className="text-xs text-muted-foreground">{meter.location}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {meter.status === "active" ? (
                      <div className="flex items-center gap-1">
                        <Power className="w-3 h-3 text-green-600" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Power className="w-3 h-3 text-muted-foreground opacity-50" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono">
                    {meter.consumption.toFixed(2)} kWh
                  </span>
                  {meter.alerts > 0 && (
                    <span className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      {meter.alerts}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="p-4 border-t border-foreground/10 space-y-2 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Total Meters</span>
          <span className="text-foreground font-medium">{meters.length}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Active</span>
          <span className="text-green-600 font-medium">
            {meters.filter((m) => m.status === "active").length}
          </span>
        </div>
      </div>
    </div>
  );
}
