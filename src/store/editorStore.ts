import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import {
  EditorElement,
  TextElement,
  ImageElement,
  ShapeElement,
  CanvasSettings,
  HistoryState,
} from "@/types/editor";

interface EditorStore {
  // Canvas settings
  canvasSettings: CanvasSettings;
  setCanvasSettings: (settings: Partial<CanvasSettings>) => void;

  // Elements
  elements: EditorElement[];
  selectedElementId: string | null;

  // Element actions
  addElement: (element: Omit<EditorElement, "id" | "zIndex">) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  selectElement: (id: string | null) => void;
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

  // Clear
  clearCanvas: () => void;
  loadTemplate: (
    elements: EditorElement[],
    canvasSettings: CanvasSettings,
  ) => void;
}

const defaultCanvasSettings: CanvasSettings = {
  width: 600,
  height: 800,
  backgroundColor: "#ffffff",
  backgroundImage: null,
  backgroundSize: "cover",
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  canvasSettings: defaultCanvasSettings,
  elements: [],
  selectedElementId: null,
  history: [],
  historyIndex: -1,

  setCanvasSettings: (settings) => {
    set((state) => ({
      canvasSettings: { ...state.canvasSettings, ...settings },
    }));
    get().saveHistory();
  },

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

  selectElement: (id) => {
    set({ selectedElementId: id });
  },

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

// Helper functions to create elements
export const createTextElement = (
  overrides?: Partial<TextElement>,
): Omit<TextElement, "id" | "zIndex"> => ({
  type: "text",
  content: "Nhập văn bản",
  position: { x: 100, y: 100 },
  size: { width: 200, height: 50 },
  rotation: 0,
  opacity: 1,
  locked: false,
  fontFamily: "Times New Roman",
  fontSize: 24,
  fontWeight: 400,
  fontStyle: "normal",
  textDecoration: "none",
  textAlign: "center",
  color: "#333333",
  backgroundColor: "transparent",
  lineHeight: 1.5,
  letterSpacing: 0,
  // New properties
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  border: { width: 0, color: "#000000", style: "solid", position: "all" },
  borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
  shadow: { enabled: false, x: 0, y: 4, blur: 8, color: "rgba(0,0,0,0.2)" },
  hyperlink: "",
  animation: { enabled: false, continuous: false, type: "none" },
  // Text Effects
  textEffect: {
    type: "none",
    offset: 50,
    direction: -45,
    blur: 0,
    transparency: 40,
    color: "#000000",
    intensity: 50,
    spread: 50,
    roundness: 50,
    curveAmount: 0,
  },
  ...overrides,
});

export const createImageElement = (
  src: string,
  overrides?: Partial<ImageElement>,
): Omit<ImageElement, "id" | "zIndex"> => ({
  type: "image",
  src,
  alt: "Image",
  position: { x: 100, y: 100 },
  size: { width: 200, height: 200 },
  rotation: 0,
  opacity: 1,
  locked: false,
  objectFit: "cover",
  // Padding
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  // Border
  border: {
    width: 0,
    color: "#000000",
    style: "solid",
    position: "all",
  },
  // Border Radius
  borderRadius: {
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0,
  },
  // Shadow
  shadow: {
    enabled: false,
    x: 0,
    y: 4,
    blur: 8,
    color: "rgba(0,0,0,0.2)",
  },
  // Link
  hyperlink: "",
  // Animation
  animation: {
    enabled: false,
    continuous: false,
    type: "none",
  },
  // Filters
  filters: {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
  },
  ...overrides,
});

export const createShapeElement = (
  shapeType: ShapeElement["shapeType"],
  overrides?: Partial<ShapeElement>,
): Omit<ShapeElement, "id" | "zIndex"> => ({
  type: "shape",
  shapeType,
  position: { x: 100, y: 100 },
  size: { width: 100, height: 100 },
  rotation: 0,
  opacity: 1,
  locked: false,
  fill: "#f472b6",
  stroke: "#ec4899",
  strokeWidth: 2,
  // Shadow
  shadow: {
    enabled: false,
    x: 0,
    y: 4,
    blur: 8,
    color: "rgba(0,0,0,0.2)",
  },
  ...overrides,
});
