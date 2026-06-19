"use client";

import { useEffect, useState, useRef } from "react";
import { brainStore } from "@/core/brainStore";
import { projectGeo } from "@/lib/geoProjection";

export default function MapFieldView() {
  const [nodes, setNodes] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const unsub = brainStore.subscribe((state) => {
      setNodes(state.geoNodes ?? []);
    });

    return () => unsub();
  }, []);

  const getColor = (score: number) => {
    if (score > 80) return "#22c55e";
    if (score > 50) return "#eab308";
    return "#ef4444";
  };

  const width = 1200;
  const height = 600;

  return (
    <div
      ref={containerRef}
      className="w-full h-screen bg-black relative overflow-hidden"
    >
      {/* MAP BACKGROUND GRID */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }}
      />

      {/* ZOOM CONTROLS */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          className="text-white px-2 py-1 border"
          onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
        >
          +
        </button>

        <button
          className="text-white px-2 py-1 border"
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
        >
          -
        </button>
      </div>

      {/* MAP LAYER */}
      <div
        style={{
          width,
          height,
          transform: `scale(${zoom})`,
          transformOrigin: "center",
          position: "relative",
          margin: "0 auto"
        }}
      >
        {/* GEO NODES */}
        {nodes.map((n) => {
          const pos = projectGeo(n.lat, n.lng, width, height);

          return (
            <div
              key={n.id}
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                transform: "translate(-50%, -50%)"
              }}
            >
              {/* PULSE */}
              <div
                style={{
                  width: n.demandScore / 5,
                  height: n.demandScore / 5,
                  borderRadius: "50%",
                  background: getColor(n.demandScore),
                  opacity: 0.6,
                  filter: "blur(6px)"
                }}
              />

              {/* CORE DOT */}
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: getColor(n.demandScore),
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)"
                }}
              />

              {/* LABEL */}
              <div className="text-white text-[10px] mt-2 text-center">
                {n.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}