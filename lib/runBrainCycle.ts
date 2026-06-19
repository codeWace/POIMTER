import { brainStore } from "@/core/brainStore";
import { evolveGeoState } from "@/core/geoEngineV5";

let intervalStarted = false;

export function startBrainCycle() {
  if (intervalStarted) return;
  intervalStarted = true;

  setInterval(() => {
    const state = brainStore.getState();

    const next = evolveGeoState(state.geoState);

    brainStore.setState({
      geoState: next,
      geoNodes: next.nodes,
    });
  }, 1200);
}