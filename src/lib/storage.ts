/**
 * Storage Service
 * Handle saving and loading data from localStorage/cloud
 */

const STORAGE_KEYS = {
  EDITOR_STATE: "wedding_editor_state",
  RECENT_COLORS: "wedding_recent_colors",
  USER_PREFERENCES: "wedding_user_preferences",
  DRAFT_CARDS: "wedding_draft_cards",
} as const;

export interface EditorSaveData {
  elements: unknown[];
  canvasSettings: unknown;
  savedAt: string;
  version: string;
}

export interface UserPreferences {
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  showGrid: false,
  snapToGrid: true,
  gridSize: 10,
  showRulers: true,
  autoSave: true,
  autoSaveInterval: 30000, // 30 seconds
};

/**
 * Save editor state to localStorage
 */
export const saveEditorState = (
  data: Omit<EditorSaveData, "savedAt" | "version">,
): void => {
  try {
    const saveData: EditorSaveData = {
      ...data,
      savedAt: new Date().toISOString(),
      version: "1.0.0",
    };
    localStorage.setItem(STORAGE_KEYS.EDITOR_STATE, JSON.stringify(saveData));
  } catch (error) {
    console.error("Error saving editor state:", error);
  }
};

/**
 * Load editor state from localStorage
 */
export const loadEditorState = (): EditorSaveData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EDITOR_STATE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading editor state:", error);
    return null;
  }
};

/**
 * Clear editor state from localStorage
 */
export const clearEditorState = (): void => {
  localStorage.removeItem(STORAGE_KEYS.EDITOR_STATE);
};

/**
 * Save recent colors
 */
export const saveRecentColors = (colors: string[]): void => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.RECENT_COLORS,
      JSON.stringify(colors.slice(0, 20)),
    );
  } catch (error) {
    console.error("Error saving recent colors:", error);
  }
};

/**
 * Load recent colors
 */
export const loadRecentColors = (): string[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECENT_COLORS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading recent colors:", error);
    return [];
  }
};

/**
 * Add a color to recent colors
 */
export const addRecentColor = (color: string): void => {
  const colors = loadRecentColors();
  const filtered = colors.filter((c) => c !== color);
  filtered.unshift(color);
  saveRecentColors(filtered);
};

/**
 * Save user preferences
 */
export const saveUserPreferences = (
  preferences: Partial<UserPreferences>,
): void => {
  try {
    const current = loadUserPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(
      STORAGE_KEYS.USER_PREFERENCES,
      JSON.stringify(updated),
    );
  } catch (error) {
    console.error("Error saving user preferences:", error);
  }
};

/**
 * Load user preferences
 */
export const loadUserPreferences = (): UserPreferences => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return data
      ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) }
      : DEFAULT_PREFERENCES;
  } catch (error) {
    console.error("Error loading user preferences:", error);
    return DEFAULT_PREFERENCES;
  }
};

/**
 * Save draft card
 */
export const saveDraftCard = (id: string, data: EditorSaveData): void => {
  try {
    const drafts = loadDraftCards();
    drafts[id] = data;
    localStorage.setItem(STORAGE_KEYS.DRAFT_CARDS, JSON.stringify(drafts));
  } catch (error) {
    console.error("Error saving draft card:", error);
  }
};

/**
 * Load all draft cards
 */
export const loadDraftCards = (): Record<string, EditorSaveData> => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DRAFT_CARDS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error loading draft cards:", error);
    return {};
  }
};

/**
 * Delete a draft card
 */
export const deleteDraftCard = (id: string): void => {
  try {
    const drafts = loadDraftCards();
    delete drafts[id];
    localStorage.setItem(STORAGE_KEYS.DRAFT_CARDS, JSON.stringify(drafts));
  } catch (error) {
    console.error("Error deleting draft card:", error);
  }
};
