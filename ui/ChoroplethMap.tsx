"use client";

import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const GEO_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

type GeoNode = {
  id: string;
  name: string;
  demandScore: number;
};

export default function ChoroplethMap({
  nodes = [],
}: {
  nodes: GeoNode[];
}) {
  const getColor = (name: string) => {
    const match = nodes.find((n) => n.name === name);

    if (!match) return "#0b0c0e"; // dark base

    const intensity = match.demandScore / 100;

    // green heat scale
    return `rgba(34, 197, 94, ${0.2 + intensity})`;
  };

  return (
    <div className="w-full h-screen bg-black">
      <ComposableMap
        projectionConfig={{ scale: 160 }}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name = geo.properties.ADMIN;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: getColor(name),
                      stroke: "#0f172a",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                    hover: {
                      fill: "#22c55e",
                      outline: "none",
                    },
                    pressed: {
                      fill: "#16a34a",
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}