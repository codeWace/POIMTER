"use client";

import { useEffect, useState } from "react";
import { runSearchNode } from "../searchNode/searchNode";
import { runMapField } from "../mapField/mapField";

type Node = {
  id: string;
  label: string;
  type: "internal" | "external";
  strength: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export default function MapView() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [mapData, setMapData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const bundle = await runSearchNode({
        product: "eraser",
        query: "eraser market"
      });

      const map = runMapField(bundle);

      // initialize physics nodes
      const initialized = map.nodes.map((n: any) => ({
        ...n,
        x: Math.random() * 300,
        y: Math.random() * 300,
        vx: 0,
        vy: 0
      }));

      setNodes(initialized);
      setMapData(map);
    }

    load();
  }, []);

  // FORCE SIMULATION LOOP
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prev) => {
        const newNodes = [...prev];

        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            const a = newNodes[i];
            const b = newNodes[j];

            let dx = a.x - b.x;
            let dy = a.y - b.y;

            const distance = Math.sqrt(dx * dx + dy * dy) || 1;

            // REPULSION FORCE
            const force = 50 / (distance * distance);

            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;

            a.vx += fx;
            a.vy += fy;

            b.vx -= fx;
            b.vy -= fy;
          }
        }

        // APPLY MOVEMENT + damping
        for (const node of newNodes) {
          node.x += node.vx;
          node.y += node.vy;

          node.vx *= 0.85;
          node.vy *= 0.85;

          // keep inside bounds
          node.x = Math.max(0, Math.min(500, node.x));
          node.y = Math.max(0, Math.min(300, node.y));
        }

        return newNodes;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  if (!mapData) return <div>Loading Poimter Field...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Poimter Force Graph</h1>

      <WorldGlobe />
    </div>
    
  );
}