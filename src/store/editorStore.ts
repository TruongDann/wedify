import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { EditorElement, CanvasSettings, HistoryState } from "@/types/editor";
import { getContrastColor } from "@/utils/colorUtils";
import { normalizeElement, createTextElement, createShapeElement } from "./helpers";

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
  alignSelection: (
    mode: "left" | "centerX" | "right" | "top" | "centerY" | "bottom",
  ) => void;
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
  appendRsvpFooter: () => void;
}

// =============================================================================
// Default Values
// =============================================================================
const getMaxContentHeight = (items: EditorElement[]) => {
  const bottom = items.reduce((max, item) => {
    const currentBottom = item.position.y + item.size.height + 180;
    return Math.max(max, currentBottom);
  }, 1200);

  return bottom;
};

const defaultCanvasSettings: CanvasSettings = {
  width: 600,
  height: 4200,
  backgroundColor: "#ffffff",
  backgroundImage: null,
  backgroundSize: "cover",
  backgroundMusic: null,
  isMusicPlaying: false,
  showGrid: true,
  snapToGrid: true,
  gridSize: 20,
  showRsvpFooter: false,
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

  alignSelection: (mode) => {
    const { selectedElementIds, elements } = get();
    const ids = selectedElementIds.length > 1 ? selectedElementIds : [];
    if (ids.length < 2) return;

    const selected = elements.filter((el) => ids.includes(el.id));
    if (selected.length < 2) return;

    const minX = Math.min(...selected.map((el) => el.position.x));
    const maxX = Math.max(...selected.map((el) => el.position.x + el.size.width));
    const minY = Math.min(...selected.map((el) => el.position.y));
    const maxY = Math.max(...selected.map((el) => el.position.y + el.size.height));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const updateMap = selected.map((el) => {
      let x = el.position.x;
      let y = el.position.y;

      switch (mode) {
        case "left":
          x = minX;
          break;
        case "centerX":
          x = centerX - el.size.width / 2;
          break;
        case "right":
          x = maxX - el.size.width;
          break;
        case "top":
          y = minY;
          break;
        case "centerY":
          y = centerY - el.size.height / 2;
          break;
        case "bottom":
          y = maxY - el.size.height;
          break;
        default:
          break;
      }

      return {
        id: el.id,
        position: { x, y },
      };
    });

    set((state) => ({
      elements: state.elements.map((el) => {
        const match = updateMap.find((item) => item.id === el.id);
        return match ? { ...el, position: match.position } : el;
      }),
    }));
    get().saveHistory();
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
    get().saveHistory();
  },

  resizeElement: (id, size) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, size } : el,
      ),
    }));
    get().saveHistory();
  },

  rotateElement: (id, rotation) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, rotation } : el,
      ),
    }));
    get().saveHistory();
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
    const normalized = elements.map((el) => normalizeElement({ ...el, id: uuidv4() }));
    const maxHeight = Math.max(canvasSettings?.height ?? 1200, getMaxContentHeight(normalized));
    set({
      elements: normalized,
      canvasSettings: {
        ...canvasSettings,
        height: maxHeight,
      },
      selectedElementId: null,
    });
    get().saveHistory();
  },

  appendRsvpFooter: () => {
    const { canvasSettings, elements } = get();
    const canvasWidth = canvasSettings.width || 600;
    const formWidth = Math.max(360, canvasWidth - 80);
    const formX = 40;
    const currentBottom = elements.length
      ? Math.max(...elements.map((element) => element.position.y + element.size.height))
      : 1200;
    const formY = currentBottom + 220;
    const formHeight = 470;

    const backgroundTone = canvasSettings.backgroundColor || "#ffffff";
    const rawBackground = String(backgroundTone).toLowerCase();
    const isBlackBackground =
      rawBackground === "black" ||
      rawBackground === "#000000" ||
      rawBackground === "rgb(0,0,0)" ||
      rawBackground.includes("0,0,0") ||
      rawBackground.includes("0, 0, 0");
    const isDarkBackground = isBlackBackground || getContrastColor(backgroundTone) === "#ffffff";
    const primaryTextColor = isDarkBackground ? "#ffffff" : "#111827";
    const fieldBackground = isDarkBackground ? "#ffffff" : "#f8fafc";
    const fieldBorder = isDarkBackground ? "rgba(255,255,255,0.32)" : "rgba(15,23,42,0.16)";
    const fieldTextColor = "#111827";

    const title = createTextElement({
      content: "RSVP",
      position: { x: formX + 30, y: formY + 26 },
      size: { width: 180, height: 36 },
      fontFamily: "Georgia, serif",
      fontSize: 28,
      fontWeight: 700,
      textAlign: "left",
      color: primaryTextColor,
      letterSpacing: 2,
    });

    const heading = createTextElement({
      content: "Xác nhận tham dự",
      position: { x: formX + 30, y: formY + 64 },
      size: { width: 360, height: 76 },
      fontFamily: "Georgia, serif",
      fontSize: 42,
      fontWeight: 700,
      textAlign: "left",
      color: primaryTextColor,
      lineHeight: 1.1,
    });

    const nameLabel = createTextElement({
      content: "Tên của bạn",
      position: { x: formX + 32, y: formY + 152 },
      size: { width: 240, height: 26 },
      fontFamily: "Arial, sans-serif",
      fontSize: 18,
      fontWeight: 500,
      textAlign: "left",
      color: primaryTextColor,
    });

    const nameInput = createTextElement({
      content: "Nhập tên của bạn",
      position: { x: formX + 30, y: formY + 186 },
      size: { width: formWidth - 60, height: 44 },
      fontFamily: "Arial, sans-serif",
      fontSize: 16,
      fontWeight: 400,
      textAlign: "left",
      color: fieldTextColor,
      backgroundColor: fieldBackground,
      border: { width: 1, color: fieldBorder, style: "solid", position: "all" },
      borderRadius: { topLeft: 12, topRight: 12, bottomLeft: 12, bottomRight: 12 },
      padding: { top: 10, right: 12, bottom: 10, left: 12 },
    });

    const attendanceLabel = createTextElement({
      content: "Sẽ tham dự",
      position: { x: formX + 32, y: formY + 246 },
      size: { width: 240, height: 26 },
      fontFamily: "Arial, sans-serif",
      fontSize: 18,
      fontWeight: 500,
      textAlign: "left",
      color: primaryTextColor,
    });

    const attendanceSelect = createTextElement({
      content: "Có mặt",
      position: { x: formX + 30, y: formY + 280 },
      size: { width: formWidth - 60, height: 44 },
      fontFamily: "Arial, sans-serif",
      fontSize: 16,
      fontWeight: 400,
      textAlign: "left",
      color: fieldTextColor,
      backgroundColor: fieldBackground,
      border: { width: 1, color: fieldBorder, style: "solid", position: "all" },
      borderRadius: { topLeft: 12, topRight: 12, bottomLeft: 12, bottomRight: 12 },
      padding: { top: 10, right: 12, bottom: 10, left: 12 },
    });

    const noteLabel = createTextElement({
      content: "Lời nhắn",
      position: { x: formX + 32, y: formY + 338 },
      size: { width: 240, height: 26 },
      fontFamily: "Arial, sans-serif",
      fontSize: 18,
      fontWeight: 500,
      textAlign: "left",
      color: primaryTextColor,
    });

    const noteInput = createTextElement({
      content: "Chúc mừng, chúc đôi bạn hạnh phúc...",
      position: { x: formX + 30, y: formY + 372 },
      size: { width: formWidth - 60, height: 72 },
      fontFamily: "Arial, sans-serif",
      fontSize: 16,
      fontWeight: 400,
      textAlign: "left",
      color: fieldTextColor,
      backgroundColor: fieldBackground,
      border: { width: 1, color: fieldBorder, style: "solid", position: "all" },
      borderRadius: { topLeft: 12, topRight: 12, bottomLeft: 12, bottomRight: 12 },
      padding: { top: 12, right: 12, bottom: 12, left: 12 },
    });

    const footerElements = [title, heading, nameLabel, nameInput, attendanceLabel, attendanceSelect, noteLabel, noteInput].map((element, index) => ({
      ...element,
      id: `rsvp-footer-element-${index}-${uuidv4()}`,
      zIndex: Math.max(0, ...elements.map((item) => item.zIndex)) + index + 1,
    })) as EditorElement[];

    const nextHeight = Math.max(
      canvasSettings.height,
      formY + formHeight + 220,
      getMaxContentHeight([...elements, ...footerElements]),
    );

    const ids = footerElements.map((element) => element.id);

    set((state) => {
      const backgroundAwareElements = state.elements.map((element) => {
        if (
          (element.type === "image" || element.type === "shape") &&
          element.position.y === 0 &&
          element.size.width >= canvasWidth * 0.8
        ) {
          return {
            ...element,
            size: {
              ...element.size,
              height: nextHeight,
            },
          };
        }

        return element;
      });

      return {
        elements: [...backgroundAwareElements, ...footerElements],
        canvasSettings: {
          ...state.canvasSettings,
          height: nextHeight,
          showRsvpFooter: true,
        },
        selectedElementId: null,
        selectedElementIds: [],
      };
    });
    get().saveHistory();
  },
}));
