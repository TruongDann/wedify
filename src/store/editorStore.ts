import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { EditorElement, CanvasSettings, HistoryState } from "@/types/editor";

// Re-export helpers for backward compatibility
export {
  createTextElement,
  createImageElement,
  createShapeElement,
  createWidgetElement,
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

  // Thao tác trên các phần tử đang chọn (phím tắt)
  clipboard: EditorElement[];
  copySelection: () => void;
  cutSelection: () => void;
  paste: () => void;
  duplicateSelection: () => void;
  deleteSelection: () => void;
  selectAll: () => void;
  /** Dịch các phần tử đang chọn; không lưu lịch sử — gọi saveHistory khi nhả phím */
  nudgeSelection: (dx: number, dy: number) => void;
  /** Đổi thứ tự lớp: ids xếp từ trên cùng xuống dưới cùng */
  reorderLayers: (ids: string[]) => void;
  /** Gom các phần tử đang chọn thành một nhóm (lớp của nhóm xếp liền nhau) */
  groupSelection: () => void;
  ungroupSelection: () => void;
  /** Bấm Shift/Ctrl: thêm hoặc bỏ phần tử (cả nhóm của nó) khỏi vùng chọn */
  toggleSelection: (id: string) => void;

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
  backgroundMusic: null,
  isMusicPlaying: false,
};

/** Id các phần tử đang chọn (một hoặc nhiều) */
const getSelectedIds = (state: {
  selectedElementId: string | null;
  selectedElementIds: string[];
}) =>
  state.selectedElementIds.length > 0
    ? state.selectedElementIds
    : state.selectedElementId
      ? [state.selectedElementId]
      : [];

/** Mở rộng danh sách id để gồm mọi phần tử cùng nhóm */
const expandGroups = (elements: EditorElement[], ids: string[]) => {
  const groupIds = new Set(
    elements
      .filter((el) => ids.includes(el.id) && el.groupId)
      .map((el) => el.groupId),
  );
  if (groupIds.size === 0) return ids;
  const extra = elements
    .filter(
      (el) => el.groupId && groupIds.has(el.groupId) && !ids.includes(el.id),
    )
    .map((el) => el.id);
  return [...ids, ...extra];
};

/** Bản sao có id mới, lệch một chút để không đè lên bản gốc; nhóm được sao thành nhóm mới */
const cloneElements = (
  source: EditorElement[],
  startZIndex: number,
  offset: number,
): EditorElement[] => {
  const newGroupIds = new Map<string, string>();
  const groupFor = (groupId?: string) => {
    if (!groupId) return undefined;
    if (!newGroupIds.has(groupId)) newGroupIds.set(groupId, uuidv4());
    return newGroupIds.get(groupId);
  };
  return [...source]
    .sort((a, b) => a.zIndex - b.zIndex)
    .map(
      (el, i) =>
        ({
          ...JSON.parse(JSON.stringify(el)),
          id: uuidv4(),
          groupId: groupFor(el.groupId),
          zIndex: startZIndex + i + 1,
          position: { x: el.position.x + offset, y: el.position.y + offset },
        }) as EditorElement,
    );
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
  clipboard: [],
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
  // Chọn một phần tử thuộc nhóm thì chọn cả nhóm; selectedElementId vẫn là phần tử được bấm
  // để bảng thuộc tính chỉnh đúng phần tử đó
  selectElement: (id) => {
    set({
      selectedElementId: id,
      selectedElementIds: id ? expandGroups(get().elements, [id]) : [],
    });
  },

  selectElements: (ids) => {
    const expanded = expandGroups(get().elements, ids);
    set({
      selectedElementIds: expanded,
      selectedElementId: expanded[0] ?? null,
    });
  },

  toggleSelection: (id) => {
    const state = get();
    const current = getSelectedIds(state);
    const members = expandGroups(state.elements, [id]);
    const next = current.includes(id)
      ? current.filter((x) => !members.includes(x))
      : [...current, ...members.filter((x) => !current.includes(x))];
    set({
      selectedElementIds: next,
      selectedElementId: next.includes(id) ? id : (next[0] ?? null),
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
  // Selection Operations (keyboard shortcuts)
  // ---------------------------------------------------------------------------
  copySelection: () => {
    const ids = getSelectedIds(get());
    if (ids.length === 0) return;
    set((state) => ({
      clipboard: JSON.parse(
        JSON.stringify(state.elements.filter((el) => ids.includes(el.id))),
      ),
    }));
  },

  cutSelection: () => {
    get().copySelection();
    get().deleteSelection();
  },

  paste: () => {
    const { clipboard, elements } = get();
    if (clipboard.length === 0) return;
    const maxZIndex = Math.max(0, ...elements.map((e) => e.zIndex));
    const pasted = cloneElements(clipboard, maxZIndex, 20);
    set((state) => ({
      elements: [...state.elements, ...pasted],
      selectedElementId: pasted[0].id,
      selectedElementIds: pasted.map((el) => el.id),
      // Dán lần nữa thì lệch thêm, không chồng lên bản vừa dán
      clipboard: pasted,
    }));
    get().saveHistory();
  },

  duplicateSelection: () => {
    const ids = getSelectedIds(get());
    if (ids.length === 0) return;
    const { elements } = get();
    const maxZIndex = Math.max(0, ...elements.map((e) => e.zIndex));
    const copies = cloneElements(
      elements.filter((el) => ids.includes(el.id)),
      maxZIndex,
      20,
    );
    set((state) => ({
      elements: [...state.elements, ...copies],
      selectedElementId: copies[0].id,
      selectedElementIds: copies.map((el) => el.id),
    }));
    get().saveHistory();
  },

  deleteSelection: () => {
    const ids = getSelectedIds(get());
    if (ids.length === 0) return;
    set((state) => ({
      elements: state.elements.filter((el) => !ids.includes(el.id)),
      selectedElementId: null,
      selectedElementIds: [],
    }));
    get().saveHistory();
  },

  selectAll: () => {
    const ids = get().elements.map((el) => el.id);
    set({ selectedElementIds: ids, selectedElementId: ids[0] ?? null });
  },

  nudgeSelection: (dx, dy) => {
    const ids = getSelectedIds(get());
    if (ids.length === 0) return;
    set((state) => ({
      elements: state.elements.map((el) =>
        ids.includes(el.id) && !el.locked
          ? {
              ...el,
              position: { x: el.position.x + dx, y: el.position.y + dy },
            }
          : el,
      ),
    }));
  },

  reorderLayers: (ids) => {
    // ids[0] là lớp trên cùng → zIndex lớn nhất
    const zIndexById = new Map(ids.map((id, i) => [id, ids.length - i]));
    set((state) => ({
      elements: state.elements.map((el) =>
        zIndexById.has(el.id) ? { ...el, zIndex: zIndexById.get(el.id)! } : el,
      ),
    }));
    get().saveHistory();
  },

  groupSelection: () => {
    const ids = getSelectedIds(get());
    if (ids.length < 2) return;
    const groupId = uuidv4();
    // Xếp các lớp của nhóm liền nhau, ngay tại vị trí lớp cao nhất của nhóm
    const layers = [...get().elements].sort((a, b) => b.zIndex - a.zIndex);
    const members = layers.filter((el) => ids.includes(el.id));
    const others = layers.filter((el) => !ids.includes(el.id));
    const insertAt = layers.findIndex((el) => ids.includes(el.id));
    const ordered = [
      ...others.slice(0, insertAt),
      ...members,
      ...others.slice(insertAt),
    ];
    const zIndexById = new Map(
      ordered.map((el, i) => [el.id, ordered.length - i]),
    );
    set((state) => ({
      elements: state.elements.map((el) => ({
        ...el,
        zIndex: zIndexById.get(el.id) ?? el.zIndex,
        groupId: ids.includes(el.id) ? groupId : el.groupId,
      })),
    }));
    get().saveHistory();
  },

  ungroupSelection: () => {
    const ids = getSelectedIds(get());
    if (!get().elements.some((el) => ids.includes(el.id) && el.groupId)) return;
    set((state) => ({
      elements: state.elements.map((el) =>
        ids.includes(el.id) ? { ...el, groupId: undefined } : el,
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
    set({
      elements: elements.map((el) => ({ ...el, id: uuidv4() })),
      canvasSettings,
      selectedElementId: null,
      selectedElementIds: [],
    });
    get().saveHistory();
  },
}));
