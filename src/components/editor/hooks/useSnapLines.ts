import { useCallback } from "react";
import Konva from "konva";
import { EditorElement } from "@/types/editor";

export interface GuideLine {
  points: number[];
  orientation: "horizontal" | "vertical";
  distance?: number;
  label?: string;
}

const SNAP_THRESHOLD = 5;

interface UseSnapLinesProps {
  elements: EditorElement[];
  canvasWidth: number;
  canvasHeight: number;
}

export const useSnapLines = ({
  elements,
  canvasWidth,
  canvasHeight,
}: UseSnapLinesProps) => {
  const getSnapLines = useCallback(
    (draggedId: string, draggedNode: Konva.Node): GuideLine[] => {
      const newGuides: GuideLine[] = [];

      // Get dragged element bounds
      const draggedBox = {
        x: draggedNode.x(),
        y: draggedNode.y(),
        width: draggedNode.width() * draggedNode.scaleX(),
        height: draggedNode.height() * draggedNode.scaleY(),
      };

      const draggedLeft = draggedBox.x;
      const draggedRight = draggedBox.x + draggedBox.width;
      const draggedTop = draggedBox.y;
      const draggedBottom = draggedBox.y + draggedBox.height;
      const draggedCenterX = draggedBox.x + draggedBox.width / 2;
      const draggedCenterY = draggedBox.y + draggedBox.height / 2;

      // Canvas center lines
      const canvasCenterX = canvasWidth / 2;
      const canvasCenterY = canvasHeight / 2;

      // Check canvas center vertical line
      if (Math.abs(draggedCenterX - canvasCenterX) < SNAP_THRESHOLD) {
        newGuides.push({
          points: [canvasCenterX, 0, canvasCenterX, canvasHeight],
          orientation: "vertical",
        });
        draggedNode.x(canvasCenterX - draggedBox.width / 2);
      }

      // Check canvas center horizontal line
      if (Math.abs(draggedCenterY - canvasCenterY) < SNAP_THRESHOLD) {
        newGuides.push({
          points: [0, canvasCenterY, canvasWidth, canvasCenterY],
          orientation: "horizontal",
        });
        draggedNode.y(canvasCenterY - draggedBox.height / 2);
      }

      // Check canvas edges
      if (Math.abs(draggedLeft) < SNAP_THRESHOLD) {
        newGuides.push({
          points: [0, 0, 0, canvasHeight],
          orientation: "vertical",
        });
        draggedNode.x(0);
      }
      if (Math.abs(draggedRight - canvasWidth) < SNAP_THRESHOLD) {
        newGuides.push({
          points: [canvasWidth, 0, canvasWidth, canvasHeight],
          orientation: "vertical",
        });
        draggedNode.x(canvasWidth - draggedBox.width);
      }
      if (Math.abs(draggedTop) < SNAP_THRESHOLD) {
        newGuides.push({
          points: [0, 0, canvasWidth, 0],
          orientation: "horizontal",
        });
        draggedNode.y(0);
      }
      if (Math.abs(draggedBottom - canvasHeight) < SNAP_THRESHOLD) {
        newGuides.push({
          points: [0, canvasHeight, canvasWidth, canvasHeight],
          orientation: "horizontal",
        });
        draggedNode.y(canvasHeight - draggedBox.height);
      }

      // Check alignment with other elements
      elements.forEach((el) => {
        if (el.id === draggedId) return;

        const elLeft = el.position.x;
        const elRight = el.position.x + el.size.width;
        const elTop = el.position.y;
        const elBottom = el.position.y + el.size.height;
        const elCenterX = el.position.x + el.size.width / 2;
        const elCenterY = el.position.y + el.size.height / 2;

        // Vertical alignments
        if (Math.abs(draggedLeft - elLeft) < SNAP_THRESHOLD) {
          const verticalSpacing = Math.abs(draggedCenterY - elCenterY);
          const distance = Math.round(verticalSpacing);
          const midX = (draggedCenterX + elCenterX) / 2;
          const topElement = draggedTop < elTop ? draggedBottom : elBottom;
          const bottomElement = draggedTop < elTop ? elTop : draggedTop;
          newGuides.push({
            points: [midX, topElement, midX, bottomElement],
            orientation: "vertical",
            distance,
            label: `${distance}px`,
          });
          draggedNode.x(elLeft);
        }

        if (Math.abs(draggedRight - elRight) < SNAP_THRESHOLD) {
          const verticalSpacing = Math.abs(draggedCenterY - elCenterY);
          const distance = Math.round(verticalSpacing);
          const midX = (draggedCenterX + elCenterX) / 2;
          const topElement = draggedTop < elTop ? draggedBottom : elBottom;
          const bottomElement = draggedTop < elTop ? elTop : draggedTop;
          newGuides.push({
            points: [midX, topElement, midX, bottomElement],
            orientation: "vertical",
            distance,
            label: `${distance}px`,
          });
          draggedNode.x(elRight - draggedBox.width);
        }

        if (Math.abs(draggedCenterX - elCenterX) < SNAP_THRESHOLD) {
          const verticalSpacing = Math.abs(draggedCenterY - elCenterY);
          const distance = Math.round(verticalSpacing);
          const topElement = draggedTop < elTop ? draggedBottom : elBottom;
          const bottomElement = draggedTop < elTop ? elTop : draggedTop;
          newGuides.push({
            points: [elCenterX, topElement, elCenterX, bottomElement],
            orientation: "vertical",
            distance,
            label: `${distance}px`,
          });
          draggedNode.x(elCenterX - draggedBox.width / 2);
        }

        if (Math.abs(draggedLeft - elRight) < SNAP_THRESHOLD) {
          const gap = Math.abs(draggedLeft - elRight);
          const distance = Math.round(gap);
          newGuides.push({
            points: [
              elRight,
              Math.min(draggedTop, elTop) - 10,
              elRight,
              Math.max(draggedBottom, elBottom) + 10,
            ],
            orientation: "vertical",
            distance,
            label: distance === 0 ? `0px` : `${distance}px gap`,
          });
          draggedNode.x(elRight);
        }

        if (Math.abs(draggedRight - elLeft) < SNAP_THRESHOLD) {
          const gap = Math.abs(draggedRight - elLeft);
          const distance = Math.round(gap);
          newGuides.push({
            points: [
              elLeft,
              Math.min(draggedTop, elTop) - 10,
              elLeft,
              Math.max(draggedBottom, elBottom) + 10,
            ],
            orientation: "vertical",
            distance,
            label: distance === 0 ? `0px` : `${distance}px gap`,
          });
          draggedNode.x(elLeft - draggedBox.width);
        }

        // Horizontal alignments
        if (Math.abs(draggedTop - elTop) < SNAP_THRESHOLD) {
          const horizontalSpacing = Math.abs(draggedCenterX - elCenterX);
          const distance = Math.round(horizontalSpacing);
          const midY = (draggedCenterY + elCenterY) / 2;
          const leftElement = draggedLeft < elLeft ? draggedRight : elRight;
          const rightElement = draggedLeft < elLeft ? elLeft : draggedLeft;
          newGuides.push({
            points: [leftElement, midY, rightElement, midY],
            orientation: "horizontal",
            distance,
            label: `${distance}px`,
          });
          draggedNode.y(elTop);
        }

        if (Math.abs(draggedBottom - elBottom) < SNAP_THRESHOLD) {
          const horizontalSpacing = Math.abs(draggedCenterX - elCenterX);
          const distance = Math.round(horizontalSpacing);
          const midY = (draggedCenterY + elCenterY) / 2;
          const leftElement = draggedLeft < elLeft ? draggedRight : elRight;
          const rightElement = draggedLeft < elLeft ? elLeft : draggedLeft;
          newGuides.push({
            points: [leftElement, midY, rightElement, midY],
            orientation: "horizontal",
            distance,
            label: `${distance}px`,
          });
          draggedNode.y(elBottom - draggedBox.height);
        }

        if (Math.abs(draggedCenterY - elCenterY) < SNAP_THRESHOLD) {
          const horizontalSpacing = Math.abs(draggedCenterX - elCenterX);
          const distance = Math.round(horizontalSpacing);
          const leftElement = draggedLeft < elLeft ? draggedRight : elRight;
          const rightElement = draggedLeft < elLeft ? elLeft : draggedLeft;
          newGuides.push({
            points: [leftElement, elCenterY, rightElement, elCenterY],
            orientation: "horizontal",
            distance,
            label: `${distance}px`,
          });
          draggedNode.y(elCenterY - draggedBox.height / 2);
        }

        if (Math.abs(draggedTop - elBottom) < SNAP_THRESHOLD) {
          const gap = Math.abs(draggedTop - elBottom);
          const distance = Math.round(gap);
          newGuides.push({
            points: [
              Math.min(draggedLeft, elLeft) - 10,
              elBottom,
              Math.max(draggedRight, elRight) + 10,
              elBottom,
            ],
            orientation: "horizontal",
            distance,
            label: distance === 0 ? `0px` : `${distance}px gap`,
          });
          draggedNode.y(elBottom);
        }

        if (Math.abs(draggedBottom - elTop) < SNAP_THRESHOLD) {
          const gap = Math.abs(draggedBottom - elTop);
          const distance = Math.round(gap);
          newGuides.push({
            points: [
              Math.min(draggedLeft, elLeft) - 10,
              elTop,
              Math.max(draggedRight, elRight) + 10,
              elTop,
            ],
            orientation: "horizontal",
            distance,
            label: distance === 0 ? `0px` : `${distance}px gap`,
          });
          draggedNode.y(elTop - draggedBox.height);
        }
      });

      // Filter to show only the nearest guideline
      if (newGuides.length > 0) {
        const verticalGuides = newGuides.filter(
          (g) => g.orientation === "vertical"
        );
        const horizontalGuides = newGuides.filter(
          (g) => g.orientation === "horizontal"
        );

        const closestVertical = verticalGuides.sort(
          (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
        )[0];

        const closestHorizontal = horizontalGuides.sort(
          (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
        )[0];

        const filteredGuides: GuideLine[] = [];
        if (closestVertical) filteredGuides.push(closestVertical);
        if (closestHorizontal) filteredGuides.push(closestHorizontal);

        return filteredGuides;
      }

      return newGuides;
    },
    [canvasWidth, canvasHeight, elements]
  );

  return { getSnapLines };
};
