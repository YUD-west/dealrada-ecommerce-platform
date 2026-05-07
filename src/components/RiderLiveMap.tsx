"use client";

import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useMemo, useState } from "react";

/** Approximate Woliso area — pickup (seller hub) */
const PICKUP = { lat: 8.536, lng: 37.962 };
/** Demo drop-off a short drive away */
const DROPOFF = { lat: 8.522, lng: 37.978 };

function lerp(
  a: google.maps.LatLngLiteral,
  b: google.maps.LatLngLiteral,
  t: number
): google.maps.LatLngLiteral {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  };
}

function normalizeStatus(status: string | null | undefined): string {
  if (!status) return "";
  return status.toUpperCase().replace(/\s+/g, "_");
}

function isDelivered(status: string | null | undefined): boolean {
  const s = normalizeStatus(status);
  return s.includes("DELIVER");
}

/** True when rider is on the way (demo animation along the route). */
function isRiderEnRoute(status: string | null | undefined): boolean {
  const s = normalizeStatus(status);
  if (!s || s.includes("NOT_FOUND")) return false;
  if (isDelivered(status)) return false;
  return s.includes("DISPATCH") || s.includes("OUT_FOR");
}

export type RiderLiveMapLabels = {
  mapLegend: string;
  noApiKey: string;
  loadError: string;
  loading: string;
  pickupTitle: string;
  dropoffTitle: string;
  riderTitle: string;
  demoNote: string;
};

const defaultLabels: RiderLiveMapLabels = {
  mapLegend: "Live map",
  noApiKey:
    "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local (Maps JavaScript API enabled) to show the rider map.",
  loadError: "Could not load Google Maps. Check the API key and billing.",
  loading: "Loading map…",
  pickupTitle: "Pickup / shop",
  dropoffTitle: "Delivery area",
  riderTitle: "Rider (approximate)",
  demoNote:
    "Rider position is a demo path until your backend sends GPS coordinates.",
};

type Props = {
  orderStatus?: string | null;
  labels?: Partial<RiderLiveMapLabels>;
};

export default function RiderLiveMap({ orderStatus, labels: labelOverrides }: Props) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "dealarada-google-maps",
    googleMapsApiKey: apiKey,
  });

  const enRoute = isRiderEnRoute(orderStatus);
  const delivered = isDelivered(orderStatus);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enRoute) {
      return;
    }
    // Reset animation baseline when entering en-route state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(0);
    const started = Date.now();
    const loopMs = 45000;
    let frame = 0;
    const tick = () => {
      const t = ((Date.now() - started) % loopMs) / loopMs;
      const eased = 0.5 - Math.cos(t * Math.PI * 2) / 2;
      setProgress(eased);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enRoute]);

  const riderPos = useMemo(() => {
    if (delivered) return DROPOFF;
    if (enRoute) return lerp(PICKUP, DROPOFF, progress);
    return PICKUP;
  }, [delivered, enRoute, progress]);

  const center = useMemo(
    () => ({
      lat: (PICKUP.lat + DROPOFF.lat) / 2,
      lng: (PICKUP.lng + DROPOFF.lng) / 2,
    }),
    []
  );

  const routePath = useMemo(() => [PICKUP, DROPOFF], []);

  if (!apiKey) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-4 text-center text-xs text-amber-900">
        <p>{labels.noApiKey}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50 p-4 text-center text-xs text-rose-800">
        {labels.loadError}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
        {labels.loading}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-600">{labels.mapLegend}</p>
      <div className="h-[min(42vh,320px)] min-h-[220px] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={14}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            gestureHandling: "greedy",
          }}
        >
          <Marker position={PICKUP} title={labels.pickupTitle} />
          <Marker position={DROPOFF} title={labels.dropoffTitle} />
          <Marker position={riderPos} title={labels.riderTitle} />
          <Polyline
            path={routePath}
            options={{
              strokeColor: "#059669",
              strokeOpacity: 0.85,
              strokeWeight: 4,
            }}
          />
        </GoogleMap>
      </div>
      <p className="text-[11px] text-slate-400">{labels.demoNote}</p>
    </div>
  );
}
