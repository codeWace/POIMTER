"use client";

import { geoNodes } from "@/core/brainStore";

export default function GeoMap({ nodes }: any) {
  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <div className="relative w-full h-full">

        {nodes.map((n: any) => {
          const intensity = Math.min(n.demandScore / 100, 1);

          return (
            <div
              key={n.id}
              className="absolute transition-all duration-700"
              style={{
                left: `${(n.lng + 180) / 3.6}%`,
                top: `${(90 - n.lat) / 1.8}%`,
                transform: "translate(-50%, -50%)"
              }}
            >
              {/* COUNTRY NODE */}
              <div
                className="rounded-full"
                style={{
                  width: 20 + intensity * 40,
                  height: 20 + intensity * 40,
                  background: `rgba(34,197,94,${intensity})`,
                  boxShadow: `0 0 20px rgba(34,197,94,${intensity})`
                }}
              />

              {/* LABEL */}
              <div className="text-[10px] text-white/70 text-center mt-1">
                {n.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}