import { create } from 'zustand';

import type { GardenState } from '../domain/types';
import { getCachedGardenState } from '../storage/gardenStateRepo';

interface GardenStore {
  gardenState: GardenState | null;
  refresh: () => void;
  setGardenState: (state: GardenState) => void;
}

export const useGardenStore = create<GardenStore>((set) => ({
  gardenState: null,
  refresh: () => set({ gardenState: getCachedGardenState() }),
  setGardenState: (state) => set({ gardenState: state }),
}));
