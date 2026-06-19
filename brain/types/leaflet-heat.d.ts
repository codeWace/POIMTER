import * as L from "leaflet";

declare module "leaflet" {
  function heatLayer(
    latlngs: any[],
    options?: any
  ): L.Layer;
}