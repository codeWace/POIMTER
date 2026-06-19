"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export function useHeatLayer(points: any[]) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let heatLayer: any;

    const load = async () => {
      // IMPORTANT: dynamic import (fixes Next.js issue)

      heatLayer = (L as any).heatLayer(points, {
        radius: 25,
        blur: 18,
        maxZoom: 17,
        minOpacity: 0.3,
        gradient: {
          0.2: "rgba(0, 0, 0, 0)",
          0.4: "#41ea35",
          0.6: "#26d440",
          0.8: "#33a517",
          1.0: "#0c5607",
        },
      });

      heatLayer.addTo(map);
    };

    load();

    return () => {
      if (heatLayer) map.removeLayer(heatLayer);
    };
  }, [map, points]);
}