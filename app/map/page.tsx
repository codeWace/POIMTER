"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { brainStore } from "@/core/brainStore";
import { resolveLocation } from "@/lib/locationResolver";
import { startBrainCycle } from "@/brain/runBrainCycle";
import { useRouter } from "next/navigation";
import { safeNumber } from "@/lib/utils/safeNumber";

const GeoHeatMap = dynamic(() => import("@/ui/GeoHeatMap"), {
  ssr: false,
});

export default function MapPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [location, setLocation] = useState("");
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  const [target, setTarget] = useState({
    lat: 20,
    lng: 0,
    zoom: 3,
  });

  useEffect(() => {
    const unsub = brainStore.subscribe((state) => {
      setNodes(state.geoNodes ?? []);
      setLocation(state.selectedLocation ?? "");
      setSession(state.activeSession ?? null);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    startBrainCycle();
  }, []);

  useEffect(() => {
    if (!location) return;

    const t = setTimeout(async () => {
      // don't geocode "Global" — just use world view
if (!location || location === "Global") {
  setTarget({ lat: 20, lng: 0, zoom: 2 });
  return;
}
const result = await resolveLocation(location);

      setTarget((prev) => ({
        ...prev,
        ...result,
      }));
    }, 400);

    return () => clearTimeout(t);
  }, [location]);

  const report = session?.report;

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">

      <GeoHeatMap nodes={nodes} center={target} query={report?.meta?.query} />

      {/* REPORT BUTTON (RESTORED) */}
      {session && (
        <button
          onClick={() => router.push("/report")}
          className="absolute bottom-6 left-16 z-[9999] bg-black text-white px-4 py-2 rounded-lg border border-green-500 hover:bg-green-950 transition"
        >
          {session.status === "ready" ? "Report Ready" : "View Report"}
          {session.status === "ready" && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
              1
            </span>
          )}
        </button>
      )}

    </div>
  );
}