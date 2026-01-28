import { StateCreator } from "zustand";
import { CanvasSettings } from "@/types/editor";

export interface CanvasSlice {
  // State
  canvasSettings: CanvasSettings;

  // Actions
  setCanvasSettings: (settings: Partial<CanvasSettings>) => void;
  resetCanvasSettings: () => void;
}

export const defaultCanvasSettings: CanvasSettings = {
  width: 600,
  height: 800,
  backgroundColor: "#ffffff",
  backgroundImage: null,
  backgroundSize: "cover",
};

export const createCanvasSlice: StateCreator<
  CanvasSlice & { saveHistory: () => void },
  [],
  [],
  CanvasSlice
> = (set, get) => ({
  canvasSettings: defaultCanvasSettings,

  setCanvasSettings: (settings) => {
    set((state) => ({
      canvasSettings: { ...state.canvasSettings, ...settings },
    }));
    get().saveHistory();
  },

  resetCanvasSettings: () => {
    set({ canvasSettings: defaultCanvasSettings });
  },
});
