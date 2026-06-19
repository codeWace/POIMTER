// return early disable websocket
export function createBrainConnection() {
  console.warn("Brain WS disabled (no server running)");
  return {
    send: () => {},
    close: () => {},
  };
}