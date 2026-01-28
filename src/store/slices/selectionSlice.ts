import { StateCreator } from "zustand";

export interface SelectionSlice {
  // State
  selectedElementId: string | null;
  selectedElementIds: string[];

  // Actions
  selectElement: (id: string | null) => void;
  selectElements: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  clearSelection: () => void;
}

export const createSelectionSlice: StateCreator<
  SelectionSlice,
  [],
  [],
  SelectionSlice
> = (set, get) => ({
  selectedElementId: null,
  selectedElementIds: [],

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

  clearSelection: () => {
    set({ selectedElementId: null, selectedElementIds: [] });
  },
});
