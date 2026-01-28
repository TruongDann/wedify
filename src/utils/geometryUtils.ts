/**
 * Geometry Utilities
 * Helper functions for position, size, and rotation calculations
 */

import { Position, Size } from "@/types/editor";

/**
 * Calculate distance between two points
 */
export const distance = (p1: Position, p2: Position): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Calculate angle between two points in degrees
 */
export const angleBetweenPoints = (p1: Position, p2: Position): number => {
  return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
};

/**
 * Rotate a point around a center point
 */
export const rotatePoint = (
  point: Position,
  center: Position,
  angleDegrees: number
): Position => {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(angleRadians);
  const sin = Math.sin(angleRadians);

  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
};

/**
 * Get center point of a rectangle
 */
export const getRectCenter = (position: Position, size: Size): Position => {
  return {
    x: position.x + size.width / 2,
    y: position.y + size.height / 2,
  };
};

/**
 * Check if a point is inside a rectangle
 */
export const isPointInRect = (
  point: Position,
  rectPosition: Position,
  rectSize: Size
): boolean => {
  return (
    point.x >= rectPosition.x &&
    point.x <= rectPosition.x + rectSize.width &&
    point.y >= rectPosition.y &&
    point.y <= rectPosition.y + rectSize.height
  );
};

/**
 * Check if two rectangles overlap
 */
export const doRectsOverlap = (
  pos1: Position,
  size1: Size,
  pos2: Position,
  size2: Size
): boolean => {
  return (
    pos1.x < pos2.x + size2.width &&
    pos1.x + size1.width > pos2.x &&
    pos1.y < pos2.y + size2.height &&
    pos1.y + size1.height > pos2.y
  );
};

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Snap value to nearest grid point
 */
export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Snap position to grid
 */
export const snapPositionToGrid = (
  position: Position,
  gridSize: number
): Position => {
  return {
    x: snapToGrid(position.x, gridSize),
    y: snapToGrid(position.y, gridSize),
  };
};

/**
 * Calculate bounding box of multiple elements
 */
export const getBoundingBox = (
  elements: Array<{ position: Position; size: Size }>
): { position: Position; size: Size } | null => {
  if (elements.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((el) => {
    minX = Math.min(minX, el.position.x);
    minY = Math.min(minY, el.position.y);
    maxX = Math.max(maxX, el.position.x + el.size.width);
    maxY = Math.max(maxY, el.position.y + el.size.height);
  });

  return {
    position: { x: minX, y: minY },
    size: { width: maxX - minX, height: maxY - minY },
  };
};

/**
 * Normalize angle to 0-360 range
 */
export const normalizeAngle = (angle: number): number => {
  return ((angle % 360) + 360) % 360;
};

/**
 * Convert degrees to radians
 */
export const degreesToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Convert radians to degrees
 */
export const radiansToDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};
