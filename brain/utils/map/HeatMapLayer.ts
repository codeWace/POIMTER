import L from "leaflet";

let heatPluginLoaded = false;


export function createHeatLayer(points: any[]) {
  return L.heatLayer(points, {
  radius: 25,
  blur: 18,
  maxZoom: 17,
});
}