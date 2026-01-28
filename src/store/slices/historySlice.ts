import { StateCreator } from "zustand";
import { EditorElement, CanvasSettings, HistoryState } from "@/types/editor";

export interface HistorySlice {
  // State
  history: HistoryState[];
  historyIndex: number;

  // Actions
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  clearHistory: () => void;
}

type HistoryStore = HistorySlice & { 
  elements: EditorElement[]; 
  canvasSettings: CanvasSettings;
  selectedElementId: string | null;
};

export const createHistorySlice: StateCreator<
  HistoryStore,
  [],
  [],
  HistorySlice
> = (set, get) => ({
  history: [],
  historyIndex: -1,

  saveHistory: () => {
    const { elements, canvasSettings, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      elements: JSON.parse(JSON.stringify(elements)),
      canvasSettings: { ...canvasSettings },
    });

    // Keep only last 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      set({
        elements: JSON.parse(JSON.stringify(prevState.elements)),
        canvasSettings: { ...prevState.canvasSettings },
        historyIndex: historyIndex - 1,
        selectedElementId: null,
      });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      set({
        elements: JSON.parse(JSON.stringify(nextState.elements)),
        canvasSettings: { ...nextState.canvasSettings },
        historyIndex: historyIndex + 1,
        selectedElementId: null,
      });
    }
  },

  clearHistory: () => {
    set({ history: [], historyIndex: -1 });
  },
});
