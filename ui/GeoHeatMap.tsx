"use client";

import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet.heat";

type GeoNode = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  demandScore: number;
  drivers: string[];
  aiRecommended?: boolean;
};

type Center = {
  lat: number;
  lng: number;
  zoom: number;
};

/* ---------------- MAP UPDATER WITH FLY-TO ---------------- */
function MapUpdater({ center, flyTo }: { center: Center; flyTo: { lat: number; lng: number } | null }) {
  const map = useMap();
  const didFly = useRef(false);

  useEffect(() => {
    if (!map) return;
    const t = setTimeout(() => {
      if (!map.getContainer() || !map._loaded) return;
      // Step 1: show world view first
      map.setView([center.lat, center.lng], center.zoom, { animate: true });
      // Step 2: fly to best market after 2s
      if (flyTo && !didFly.current) {
        didFly.current = true;
        setTimeout(() => {
          map.flyTo([flyTo.lat, flyTo.lng], 5, { animate: true, duration: 2.5 });
        }, 2000);
      }
    }, 100);
    return () => clearTimeout(t);
  }, [center, flyTo, map]);

  return null;
}

/* ---------------- HEAT LAYER ---------------- */
function HeatLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !points?.length) return;
    const safePoints = points.filter(p =>
      Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]) && Number.isFinite(p[2])
    );
    const layer = (L as any).heatLayer(safePoints, {
      radius: 35,
      blur: 25,
      maxZoom: 10,
      minOpacity: 0.3,
      gradient: { 0.2: "#064e3b", 0.5: "#16a34a", 0.8: "#22c55e", 1.0: "#86efac" },
    });
    layer.addTo(map);
    return () => { map.removeLayer(layer); };
  }, [map, points]);
  return null;
}

/* ---------------- PULSE MARKERS FOR AI RECOMMENDED ---------------- */
function PulseMarkers({ nodes }: { nodes: GeoNode[] }) {
  const map = useMap();
  const layersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!map) return;
    layersRef.current.forEach(l => map.removeLayer(l));
    layersRef.current = [];

    nodes.filter(n => n.aiRecommended && Number.isFinite(n.lat) && Number.isFinite(n.lng))
      .forEach(n => {
        const score = n.demandScore ?? 50;
        const color = score > 70 ? "#22c55e" : score > 50 ? "#facc15" : "#60a5fa";

        // outer pulse ring
        const outer = L.circleMarker([n.lat, n.lng], {
          radius: 18,
          color,
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.08,
        }).addTo(map);

        // inner dot
        const inner = L.circleMarker([n.lat, n.lng], {
          radius: 6,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.9,
        }).addTo(map);

        inner.bindTooltip(`
          <div style="background:#000;border:1px solid #22c55e;padding:6px 10px;border-radius:8px;color:#fff;font-size:11px;min-width:140px">
            <div style="color:#22c55e;font-size:9px;letter-spacing:2px;margin-bottom:4px">AI RECOMMENDED</div>
            <div style="font-weight:bold;margin-bottom:2px">${n.name}</div>
            <div style="color:#22c55e">Opportunity: ${score}</div>
          </div>
        `, { permanent: false, direction: "top", opacity: 1, className: "custom-tooltip" });

        layersRef.current.push(outer, inner);
      });

    return () => { layersRef.current.forEach(l => map.removeLayer(l)); };
  }, [map, nodes]);

  return null;
}

/* ---------------- MAIN COMPONENT ---------------- */
export default function GeoHeatMap({
  nodes,
  center,
  query,
}: {
  nodes: GeoNode[];
  center: Center;
  query?: string;
}) {
  const [geoData, setGeoData] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
      .then(r => r.json())
      .then(setGeoData);
  }, []);

  /* ---------------- HEAT POINTS ---------------- */
  const heatPoints = useMemo(() => {
    return nodes
      .filter(n => Number.isFinite(n.lat) && Number.isFinite(n.lng) && Number.isFinite(n.demandScore))
      .flatMap(n =>
        Array.from({ length: 16 }, () => [
          n.lat + (Math.random() - 0.5) * 1.5,
          n.lng + (Math.random() - 0.5) * 1.5,
          Math.min(n.demandScore / 100, 1),
        ] as [number, number, number])
      );
  }, [nodes]);

  /* ---------------- COUNTRY CODES ---------------- */
  const COUNTRY_CODES: Record<string, string> = {
    "united states": "US", "usa": "US", "texas": "US", "california": "US",
    "united kingdom": "GB", "uk": "GB", "england": "GB",
    "india": "IN", "china": "CN", "pakistan": "PK", "australia": "AU",
    "germany": "DE", "france": "FR", "italy": "IT", "spain": "ES",
    "brazil": "BR", "canada": "CA", "mexico": "MX", "japan": "JP",
    "south korea": "KR", "uae": "AE", "saudi arabia": "SA",
    "nigeria": "NG", "kenya": "KE", "south africa": "ZA",
    "new zealand": "NZ", "netherlands": "NL", "bangladesh": "BD",
    "indonesia": "ID", "turkey": "TR", "argentina": "AR",
  };

  const NODE_COUNTRY_CODES: Record<string, string> = {
    "India": "IN", "China": "CN", "United States": "US", "United Kingdom": "GB",
    "United Arab Emirates": "AE", "USA": "US", 
    "Germany": "DE", "UAE": "AE", "Australia": "AU", "Japan": "JP",
    "Brazil": "BR", "Nigeria": "NG", "South Africa": "ZA", "France": "FR",
    "Pakistan": "PK", "Kenya": "KE", "Canada": "CA",
  };

  const highlightCountry = useMemo(() => {
    const q = (query ?? "").toLowerCase();
    for (const [key, code] of Object.entries(COUNTRY_CODES)) {
      if (q.includes(key)) return code;
    }
    return null;
  }, [query]);

  const nodeCodeSet = useMemo(() => {
    return new Set(nodes.map(n => NODE_COUNTRY_CODES[n.name]).filter(Boolean));
  }, [nodes]);

  const aiRecommendedCodes = useMemo(() => {
    return new Set(
      nodes.filter(n => n.aiRecommended).map(n => NODE_COUNTRY_CODES[n.name]).filter(Boolean)
    );
  }, [nodes]);

  /* ---------------- FLY TO BEST MARKET ---------------- */
  const flyToTarget = useMemo(() => {
    const best = nodes.find(n => n.aiRecommended);
    if (!best) return null;
    return { lat: best.lat, lng: best.lng };
  }, [nodes]);

  /* ---------------- STYLE FEATURE ---------------- */
  const styleFeature = (feature: any) => {
    const code = feature.properties?.ISO_A2 || feature.properties?.ISO_A3 || feature.id;
    const isOrigin = code === highlightCountry;
    const isAiPick = aiRecommendedCodes.has(code);
    const isNode = nodeCodeSet.has(code);

    if (isOrigin) return { fillColor: "#3b82f6", weight: 2, color: "#60a5fa", fillOpacity: 0.7 };
    if (isAiPick) return { fillColor: "#22c55e", weight: 2, color: "#86efac", fillOpacity: 0.6 };
    if (isNode) return { fillColor: "#16a34a", weight: 1, color: "#14181f", fillOpacity: 0.3 };
    return { fillColor: "#0b0f0a", weight: 0.5, color: "#14181f", fillOpacity: 0.2 };
  };

  /* ---------------- ON EACH FEATURE (click handler) ---------------- */
  const onEachFeature = (feature: any, layer: any) => {
  layer.on({
    click: () => {
      const code = feature.properties?.ISO_A2 || feature.properties?.iso_a2;
      const name = feature.properties?.ADMIN || feature.properties?.NAME || feature.properties?.name || "Unknown";

      // More robust node matching
      const node = nodes.find(n => {
        const nodeCode = NODE_COUNTRY_CODES[n.name];
        const nameMatch = name.toLowerCase() === n.name.toLowerCase() ||
                          name.toLowerCase().includes(n.name.toLowerCase()) ||
                          n.name.toLowerCase().includes(name.toLowerCase());
        return (nodeCode && nodeCode === code) || nameMatch;
      });

      setSelectedCountry({
        name: node?.name ?? name,   // ← use node.name if found, else GeoJSON name
        code,
        demandScore: node?.demandScore ?? null,
        aiRecommended: node?.aiRecommended ?? false,
        isOrigin: code === highlightCountry,
      });
    },
  });
};

  /* ---------------- SORTED LEADERBOARD ---------------- */
  const leaderboard = useMemo(() => {
    return [...nodes].sort((a, b) => b.demandScore - a.demandScore);
  }, [nodes]);

  /* ---------------- RENDER ---------------- */
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={center.zoom}
        minZoom={2}
        maxZoom={16}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
        style={{ height: "100vh", width: "100%" }}
        scrollWheelZoom
      >
        <MapUpdater center={center} flyTo={flyToTarget} />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {geoData && <GeoJSON data={geoData} style={styleFeature} onEachFeature={onEachFeature} />}
        <HeatLayer points={heatPoints} />
        <PulseMarkers nodes={nodes} />
      </MapContainer>

      {/* ---------------- QUERY BANNER ---------------- */}
      {query && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] bg-black/80 border border-green-500/30 backdrop-blur px-4 py-2 rounded-full text-xs text-white/70 max-w-[500px] text-center">
          <span className="text-green-400">INTELLIGENCE ACTIVE — </span>
          {query.length > 80 ? query.slice(0, 80) + "..." : query}
        </div>
      )}

      {/* ---------------- COUNTRY CLICK BRIEF ---------------- */}
      {selectedCountry && (
        <div className="absolute top-16 left-4 z-[9999] w-[260px] bg-black/90 border border-green-500/30 rounded-xl p-4 backdrop-blur">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[9px] text-green-400 tracking-widest mb-1">
                {selectedCountry.isOrigin ? "YOUR MARKET" : selectedCountry.aiRecommended ? "AI RECOMMENDED" : "MARKET"}
              </div>
              <div className="text-white font-bold text-sm">{selectedCountry.name}</div>
            </div>
            <button onClick={() => setSelectedCountry(null)} className="text-white/40 hover:text-white text-lg leading-none">×</button>
          </div>

          {selectedCountry.demandScore !== null ? (
            <>
              <div className="flex justify-between text-xs mb-3">
                <span className="text-white/50">Opportunity Score</span>
                <span className={selectedCountry.demandScore > 65 ? "text-green-400 font-bold" : "text-yellow-400 font-bold"}>
                  {selectedCountry.demandScore}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded h-1 mb-3">
                <div className="h-1 bg-green-400 rounded" style={{ width: `${selectedCountry.demandScore}%` }} />
              </div>
              {selectedCountry.aiRecommended && (
                <div className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 rounded px-2 py-1 mb-2">
                  ✓ AI selected as top expansion market
                </div>
              )}
              {selectedCountry.isOrigin && (
                <div className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded px-2 py-1 mb-2">
                  ← Your current market
                </div>
              )}
            </>
          ) : (
            <div className="text-white/40 text-xs">No signal data for this market</div>
          )}
        </div>
      )}

      {/* ---------------- LEGEND ---------------- */}
      <div className="absolute bottom-24 left-4 z-[9999] bg-black/80 border border-white/10 rounded-lg p-3 text-[10px] space-y-1.5">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-blue-500 opacity-80" /><span className="text-white/60">Your Market</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-500 opacity-80" /><span className="text-white/60">AI Recommended</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-900 opacity-80" /><span className="text-white/60">In Analysis</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-white/10" /><span className="text-white/60">No Signal</span></div>
      </div>

      {/* ---------------- GLOBAL OPPORTUNITY LEADERBOARD ---------------- */}
      <div className="absolute top-16 right-4 z-[9999] w-[220px]">
        <button
          onClick={() => setShowLeaderboard(v => !v)}
          className="w-full flex justify-between items-center bg-black/80 border border-green-500/30 rounded-t-lg px-3 py-2 text-[10px] text-green-400 tracking-widest"
        >
          OPPORTUNITY RANKING
          <span>{showLeaderboard ? "▲" : "▼"}</span>
        </button>

        {showLeaderboard && (
          <div className="bg-black/90 border border-green-500/20 border-t-0 rounded-b-lg overflow-hidden">
            <div className="historyScroll max-h-[300px] overflow-y-auto">
              {leaderboard.map((n, i) => (
                <div
                  key={n.id}
                  className={`flex items-center justify-between px-3 py-2 border-b border-white/5 cursor-pointer hover:bg-white/5 transition ${n.aiRecommended ? "bg-green-500/5" : ""}`}
                  onClick={() => setSelectedCountry({
                    name: n.name,
                    demandScore: n.demandScore,
                    aiRecommended: n.aiRecommended,
                    isOrigin: false,
                  })}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 text-[9px] w-4">#{i + 1}</span>
                    <span className={`text-xs ${n.aiRecommended ? "text-green-400 font-bold" : "text-white/70"}`}>
                      {n.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 bg-white/10 rounded h-1">
                      <div
                        className={`h-1 rounded ${n.aiRecommended ? "bg-green-400" : "bg-white/30"}`}
                        style={{ width: `${n.demandScore}%` }}
                      />
                    </div>
                    <span className={`text-[10px] ${n.aiRecommended ? "text-green-400" : "text-white/40"}`}>
                      {n.demandScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
