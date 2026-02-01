/**
 * Text template configuration for the wedding card editor
 * Centralized location for all text templates
 */

export interface TextTemplate {
  id: string;
  name: string;
  content: string;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  previewStyle?: React.CSSProperties;
}

/**
 * Available text templates for the editor
 * Add or modify templates here for easier maintenance
 */
export const TEXT_TEMPLATES: TextTemplate[] = [
  {
    id: "adventure",
    name: "Adventure",
    content: "ADVENTURE",
    fontSize: 36,
    fontWeight: 700,
    fontFamily: "Brush Script MT",
    previewStyle: {
      fontFamily: "Brush Script MT, cursive",
      fontStyle: "italic",
    },
  },
  // Add more templates here
];
