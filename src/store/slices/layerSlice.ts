import { StateCreator } from "zustand";
import { EditorElement } from "@/types/editor";

export interface LayerSlice {
  // Actions
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
}

export const createLayerSlice: StateCreator<
  LayerSlice & { elements: EditorElement[]; saveHistory: () => void },
  [],
  [],
  LayerSlice
> = (set, get) => ({
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
});
