import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { EditorElement, CanvasSettings, HistoryState } from "@/types/editor";

// Re-export helpers for backward compatibility
export {
  createTextElement,
  createImageElement,
  createShapeElement,
} from "./helpers";

// =============================================================================
// Types
// =============================================================================
interface EditorStore {
  // Canvas settings
  canvasSettings: CanvasSettings;
  setCanvasSettings: (settings: Partial<CanvasSettings>) => void;

  // Elements
  elements: EditorElement[];
  selectedElementId: string | null;
  selectedElementIds: string[];

  // Element actions
  addElement: (element: Omit<EditorElement, "id" | "zIndex">) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  selectElements: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  moveElement: (id: string, position: { x: number; y: number }) => void;
  resizeElement: (id: string, size: { width: number; height: number }) => void;
  rotateElement: (id: string, rotation: number) => void;

  // Layer actions
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;

  // History
  history: HistoryState[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;

  // Clear & Template
  clearCanvas: () => void;
  loadTemplate: (
    elements: EditorElement[],
    canvasSettings: CanvasSettings,
  ) => void;
}

// =============================================================================
// Default Values
// =============================================================================
const defaultCanvasSettings: CanvasSettings = {
  width: 600,
  height: 800,
  backgroundColor: "#ffffff",
  backgroundImage: null,
  backgroundSize: "cover",
};

// =============================================================================
// Store
// =============================================================================
export const useEditorStore = create<EditorStore>((set, get) => ({
  // ---------------------------------------------------------------------------
  // Initial State
  // ---------------------------------------------------------------------------
  canvasSettings: defaultCanvasSettings,
  elements: [],
  selectedElementId: null,
  selectedElementIds: [],
  history: [],
  historyIndex: -1,

  // ---------------------------------------------------------------------------
  // Canvas Settings
  // ---------------------------------------------------------------------------
  setCanvasSettings: (settings) => {
    set((state) => ({
      canvasSettings: { ...state.canvasSettings, ...settings },
    }));
    get().saveHistory();
  },

  // ---------------------------------------------------------------------------
  // Element CRUD
  // ---------------------------------------------------------------------------
  addElement: (element) => {
    const id = uuidv4();
    const maxZIndex = Math.max(0, ...get().elements.map((e) => e.zIndex));
    const newElement = {
      ...element,
      id,
      zIndex: maxZIndex + 1,
    } as EditorElement;

    set((state) => ({
      elements: [...state.elements, newElement],
      selectedElementId: id,
    }));
    get().saveHistory();
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? ({ ...el, ...updates } as EditorElement) : el,
      ),
    }));
    get().saveHistory();
  },

  deleteElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId:
        state.selectedElementId === id ? null : state.selectedElementId,
    }));
    get().saveHistory();
  },

  duplicateElement: (id) => {
    const element = get().elements.find((el) => el.id === id);
    if (element) {
      const newId = uuidv4();
      const maxZIndex = Math.max(0, ...get().elements.map((e) => e.zIndex));
      const newElement = {
        ...element,
        id: newId,
        zIndex: maxZIndex + 1,
        position: {
          x: element.position.x + 20,
          y: element.position.y + 20,
        },
      };
      set((state) => ({
        elements: [...state.elements, newElement],
        selectedElementId: newId,
      }));
      get().saveHistory();
    }
  },

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------
  selectElement: (id) => {
    set({ selectedElementId: id, selectedElementIds: id ? [id] : [] });
  },

  selectElements: (ids) => {
    set({
      selectedElementIds: ids,
      selectedElementId:
        ids.length === 1 ? ids[0] : ids.length > 0 ? ids[0] : null,
    });
  },

  addToSelection: (id) => {
    const { selectedElementIds } = get();
    if (!selectedElementIds.includes(id)) {
      const newSelection = [...selectedElementIds, id];
      set({
        selectedElementIds: newSelection,
        selectedElementId:
          newSelection.length === 1 ? newSelection[0] : newSelection[0],
      });
    }
  },

  // ---------------------------------------------------------------------------
  // Element Transform
  // ---------------------------------------------------------------------------
  moveElement: (id, position) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, position } : el,
      ),
    }));
  },

  resizeElement: (id, size) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, size } : el,
      ),
    }));
  },

  rotateElement: (id, rotation) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, rotation } : el,
      ),
    }));
  },

  // ---------------------------------------------------------------------------
  // Layer Management
  // ---------------------------------------------------------------------------
  bringToFront: (id) => {
    const maxZIndex = Math.max(...get().elements.map((e) => e.zIndex));
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, zIndex: maxZIndex + 1 } : el,
      ),
    }));
    get().saveHistory();
  },

  sendToBack: (id) => {
    const minZIndex = Math.min(...get().elements.map((e) => e.zIndex));
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, zIndex: minZIndex - 1 } : el,
      ),
    }));
    get().saveHistory();
  },

  bringForward: (id) => {
    const elements = get().elements;
    const element = elements.find((el) => el.id === id);
    if (element) {
      const higherElements = elements.filter(
        (el) => el.zIndex > element.zIndex,
      );
      if (higherElements.length > 0) {
        const nextElement = higherElements.reduce((prev, curr) =>
          curr.zIndex < prev.zIndex ? curr : prev,
        );
        set((state) => ({
          elements: state.elements.map((el) => {
            if (el.id === id) return { ...el, zIndex: nextElement.zIndex };
            if (el.id === nextElement.id)
              return { ...el, zIndex: element.zIndex };
            return el;
          }),
        }));
        get().saveHistory();
      }
    }
  },

  sendBackward: (id) => {
    const elements = get().elements;
    const element = elements.find((el) => el.id === id);
    if (element) {
      const lowerElements = elements.filter((el) => el.zIndex < element.zIndex);
      if (lowerElements.length > 0) {
        const prevElement = lowerElements.reduce((prev, curr) =>
          curr.zIndex > prev.zIndex ? curr : prev,
        );
        set((state) => ({
          elements: state.elements.map((el) => {
            if (el.id === id) return { ...el, zIndex: prevElement.zIndex };
            if (el.id === prevElement.id)
              return { ...el, zIndex: element.zIndex };
            return el;
          }),
        }));
        get().saveHistory();
      }
    }
  },

  // ---------------------------------------------------------------------------
  // History (Undo/Redo)
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Canvas Operations
  // ---------------------------------------------------------------------------
  clearCanvas: () => {
    set({
      elements: [],
      selectedElementId: null,
      canvasSettings: defaultCanvasSettings,
    });
    get().saveHistory();
  },

  loadTemplate: (elements, canvasSettings) => {
    set({
      elements: elements.map((el) => ({ ...el, id: uuidv4() })),
      canvasSettings,
      selectedElementId: null,
    });
    get().saveHistory();
  },
}));
