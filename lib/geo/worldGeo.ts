import world from "world-atlas/countries-110m.json";
import { feature } from "topojson-client";

export const geoJson = feature(
  world as any,
  (world as any).objects.countries
);