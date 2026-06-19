import { brainStore } from "@/core/brainStore";
import { computeSystemThought } from "@/brain/phase10Engine";
import { generateNodeActions, generateSwarmSignals } from "@/brain/phase9Engine";

let interval: any = null;

export const startBrainCycle = () => {
  if (interval) return;

  interval = setInterval(() => {
    const state = brainStore.getState();

    const metrics = {
      search: state.agents?.search?.signal || 50,
      map: state.agents?.map?.signal || 50,
      report: state.agents?.report?.signal || 50,
    };


    // 2. SYSTEM THOUGHT
    const systemThought = computeSystemThought(metrics);

    // 3. SWARM SIGNALS (optional memory layer)
    const swarm = generateSwarmSignals(metrics, {});

    // (optional: you can later store systemThought/swarm too)
  }, 3000); // every 3 seconds (SAFE for UI)
};

export const stopBrainCycle = () => {
  if (interval) clearInterval(interval);
  interval = null;
};