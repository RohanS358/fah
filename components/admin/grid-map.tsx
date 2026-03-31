"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, KeyRound, MapPin } from "lucide-react";

interface GridMapProps {
  selectedMeterId: string | null;
  onSelectMeter: (meterId: string) => void;
}

interface Meter {
  id: string;
  location: string;
  lat: number;
  lng: number;
  consumption: number;
  status: "active" | "inactive";
}

declare global {
  interface Window {
    google?: any;
    __googleMapsScriptLoadingPromise?: Promise<void>;
  }
}

const FALLBACK_CENTER = { lat: 27.7172, lng: 85.324 };
const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_DJANGO_API_BASE || "http://127.0.0.1:9000";

const loadGoogleMaps = async (apiKey: string) => {
  if (typeof window === "undefined") return;
  if (window.google?.maps) return;
  if (window.__googleMapsScriptLoadingPromise) {
    await window.__googleMapsScriptLoadingPromise;
    return;
  }

  window.__googleMapsScriptLoadingPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Maps")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  await window.__googleMapsScriptLoadingPromise;
};

export function GridMap({ selectedMeterId, onSelectMeter }: GridMapProps) {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [metersLoaded, setMetersLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [googleKeyAvailable, setGoogleKeyAvailable] = useState(false);
  const [usingGoogleMaps, setUsingGoogleMaps] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    let activeController: AbortController | null = null;
    let cancelled = false;

    const loadMeters = async (silent = false) => {
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
        const mapped: Meter[] = Array.isArray(data.meters)
          ? data.meters
              .filter((meter: any) => meter.lat !== null && meter.lng !== null)
              .map((meter: any) => ({
                id: meter.id || meter.meter_id,
                location: meter.location || "Unknown location",
                lat: Number(meter.lat),
                lng: Number(meter.lng),
                consumption: Number(meter.current_value ?? 0),
                status: meter.status === "active" ? "active" : "inactive",
              }))
          : [];

        if (cancelled) return;
        setMeters(mapped);
        setLoadError(null);
      } catch (error) {
        if ((error as Error).name === "AbortError" || cancelled) return;
        if (!silent) {
          setLoadError("Could not load meter locations from backend.");
        }
      } finally {
        if (!cancelled) {
          setMetersLoaded(true);
        }
      }
    };

    loadMeters();
    const intervalId = setInterval(() => loadMeters(true), 10000);

    return () => {
      cancelled = true;
      activeController?.abort();
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
    setGoogleKeyAvailable(Boolean(apiKey));

    if (!apiKey || !mapNodeRef.current) {
      setUsingGoogleMaps(false);
      setMapReady(false);
      return;
    }

    let cancelled = false;
    const initialize = async () => {
      try {
        await loadGoogleMaps(apiKey);
        if (cancelled || !window.google?.maps || !mapNodeRef.current) return;

        mapRef.current = new window.google.maps.Map(mapNodeRef.current, {
          center: FALLBACK_CENTER,
          zoom: 8,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        infoWindowRef.current = new window.google.maps.InfoWindow();
        setUsingGoogleMaps(true);
        setMapReady(true);
      } catch (error) {
        if (cancelled) return;
        setUsingGoogleMaps(false);
        setMapReady(false);
        setLoadError((error as Error).message || "Google Maps failed to load.");
      }
    };

    initialize();

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      mapRef.current = null;
      infoWindowRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.google?.maps) return;

    const map = mapRef.current;
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    meters.forEach((meter) => {
      const selected = meter.id === selectedMeterId;
      const marker = new window.google.maps.Marker({
        map,
        position: { lat: meter.lat, lng: meter.lng },
        title: `${meter.id} • ${meter.location}`,
        animation: selected ? window.google.maps.Animation.BOUNCE : undefined,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: meter.status === "active" ? "#16a34a" : "#64748b",
          fillOpacity: selected ? 1 : 0.85,
          strokeColor: selected ? "#111827" : "#ffffff",
          strokeWeight: selected ? 2 : 1,
          scale: selected ? 9 : 7,
        },
      });

      marker.addListener("click", () => {
        onSelectMeter(meter.id);
        infoWindowRef.current?.setContent(
          `<div style="font-size:12px;line-height:1.4"><strong>${meter.id}</strong><br/>${meter.location}<br/>${meter.consumption.toFixed(2)} kWh</div>`
        );
        infoWindowRef.current?.open({ map, anchor: marker });
      });

      markersRef.current.push(marker);
      bounds.extend(marker.getPosition());
    });

    if (meters.length > 0) {
      map.fitBounds(bounds, 60);
      if (meters.length === 1) map.setZoom(12);
    } else {
      map.setCenter(FALLBACK_CENTER);
      map.setZoom(8);
    }
  }, [mapReady, meters, selectedMeterId, onSelectMeter]);

  const selectionMissingOnMap = Boolean(
    selectedMeterId && !meters.find((meter) => meter.id === selectedMeterId)
  );

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-background to-background/80">
      <div ref={mapNodeRef} className={`h-full w-full ${usingGoogleMaps ? "block" : "hidden"}`} />

      {!usingGoogleMaps && (
        <div className="h-full w-full p-6 flex flex-col gap-4">
          {!googleKeyAvailable ? (
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 text-sm">
              <p className="font-medium flex items-center gap-2 text-orange-700">
                <KeyRound className="h-4 w-4" />
                Google Maps key missing
              </p>
              <p className="text-muted-foreground mt-1">
                Set <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable map rendering.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
              <p className="font-medium flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                Google Maps unavailable
              </p>
              <p className="text-muted-foreground mt-1">{loadError || "Unable to initialize map."}</p>
            </div>
          )}

          <div className="rounded-lg border border-foreground/10 bg-card/40 p-4">
            <p className="text-sm font-medium mb-2">Meters with location data</p>
            <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
              {meters.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {metersLoaded
                    ? "No meters with coordinates found."
                    : "Loading meter locations from backend..."}
                </p>
              ) : (
                meters.map((meter) => (
                  <button
                    key={meter.id}
                    onClick={() => onSelectMeter(meter.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedMeterId === meter.id
                        ? "border-foreground/30 bg-foreground/10"
                        : "border-foreground/10 bg-background/50 hover:bg-foreground/5"
                    }`}
                  >
                    <p className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {meter.id}
                    </p>
                    <p className="text-xs text-muted-foreground">{meter.location}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {(mapReady || metersLoaded) && (
        <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm border border-foreground/10 rounded-lg p-3 text-xs space-y-2 max-w-xs">
          <p className="font-medium">Map Legend</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span className="text-muted-foreground">Active Meter</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-muted-foreground">Inactive Meter</span>
          </div>
        </div>
      )}

      {selectionMissingOnMap && (
        <div className="absolute top-4 left-4 right-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs">
          Selected meter has no coordinates in backend map payload.
        </div>
      )}
    </div>
  );
}
