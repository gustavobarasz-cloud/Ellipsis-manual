// Shared by server pages and the client hub, so it must not be a client module.
export const GOLDEN_THREAD: { from: string; to: string; label: string }[] = [
  { from: "white.w3", to: "white.w5", label: "W3 column 4 → W5" },
  { from: "blue.B1", to: "blue.B2", label: "B1 → B2" },
  { from: "blue.B3", to: "blue.B5", label: "B3 → B5" },
  { from: "blue.B5", to: "brown.Br1", label: "B5 → Br1" },
  { from: "brown.Br1", to: "brown.Br4", label: "Br1 → Br4" },
  { from: "brown.Br4", to: "brown.Br5", label: "Br4 → Br5" },
];

export function labelOf(store: string) {
  return store === "sanctuary" ? "Sanctuary" : `${store[0].toUpperCase()}${store.slice(1)} Belt`;
}
