import { StateCreator } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { EditorElement } from "@/types/editor";

export interface ElementsSlice {
  // State
  elements: EditorElement[];

  // Actions
  addElement: (element: Omit<EditorElement, "id" | "zIndex">) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  moveElement: (id: string, position: { x: number; y: number }) => void;
  resizeElement: (id: string, size: { width: number; height: number }) => void;
  rotateElement: (id: string, rotation: number) => void;
  setElements: (elements: EditorElement[]) => void;
}

export const createElementsSlice: StateCreator<
  ElementsSlice & { selectedElementId: string | null; saveHistory: () => void },
  [],
  [],
  ElementsSlice
> = (set, get) => ({
  elements: [],

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

  setElements: (elements) => {
    set({ elements });
  },
});
