import L from "leaflet";
import "leaflet.heat";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

function HeatLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();
  const layerRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !points?.length) return;

    const safePoints = points.filter(
      (p) =>
        Number.isFinite(p[0]) &&
        Number.isFinite(p[1]) &&
        Number.isFinite(p[2])
    );

    //  REMOVE OLD LAYER
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    // 💣 REMOVE ANY STRAY HEAT CANVAS
    map.eachLayer((l: any) => {
      if (l._heat) {
        map.removeLayer(l);
      }
    });

    const layer = (L as any).heatLayer(safePoints, {
      radius: 25,
      blur: 18,
      maxZoom: 10,
      minOpacity: 0.4,
      gradient: {
        0.0: "#0b1f14",
        0.3: "#14532d",
        0.6: "#22c55e",
        0.85: "#86efac",
        1.0: "#ffffff",
      },
    });

    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, points]);

  return null;
}