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
      const canvasCenterX = canvasWidth / 2;
      const canvasCenterY = canvasHeight / 2;

      const addGuide = (
        orientation: "horizontal" | "vertical",
        points: number[],
        distance?: number,
        label?: string,
      ) => {
        newGuides.push({ points, orientation, distance, label });
      };

      const verticalCandidates: Array<{ distance: number; guide: GuideLine; x: number }> = [];
      const horizontalCandidates: Array<{ distance: number; guide: GuideLine; y: number }> = [];

      const pushVertical = (x: number, y1: number, y2: number, distance: number, label?: string) => {
        const guide: GuideLine = {
          points: [x, y1, x, y2],
          orientation: "vertical",
          distance,
          label,
        };
        verticalCandidates.push({ distance, guide, x });
        addGuide("vertical", [x, y1, x, y2], distance, label);
      };

      const pushHorizontal = (y: number, x1: number, x2: number, distance: number, label?: string) => {
        const guide: GuideLine = {
          points: [x1, y, x2, y],
          orientation: "horizontal",
          distance,
          label,
        };
        horizontalCandidates.push({ distance, guide, y });
        addGuide("horizontal", [x1, y, x2, y], distance, label);
      };

      if (Math.abs(draggedCenterX - canvasCenterX) < SNAP_THRESHOLD) {
        pushVertical(canvasCenterX, 0, canvasHeight, 0, "center");
        draggedNode.x(canvasCenterX - draggedBox.width / 2);
      }
      if (Math.abs(draggedCenterY - canvasCenterY) < SNAP_THRESHOLD) {
        pushHorizontal(canvasCenterY, 0, canvasWidth, 0, "center");
        draggedNode.y(canvasCenterY - draggedBox.height / 2);
      }
      if (Math.abs(draggedLeft) < SNAP_THRESHOLD) {
        pushVertical(0, 0, canvasHeight, 0, "left");
        draggedNode.x(0);
      }
      if (Math.abs(draggedRight - canvasWidth) < SNAP_THRESHOLD) {
        pushVertical(canvasWidth, 0, canvasHeight, 0, "right");
        draggedNode.x(canvasWidth - draggedBox.width);
      }
      if (Math.abs(draggedTop) < SNAP_THRESHOLD) {
        pushHorizontal(0, 0, canvasWidth, 0, "top");
        draggedNode.y(0);
      }
      if (Math.abs(draggedBottom - canvasHeight) < SNAP_THRESHOLD) {
        pushHorizontal(canvasHeight, 0, canvasWidth, 0, "bottom");
        draggedNode.y(canvasHeight - draggedBox.height);
      }

      elements.forEach((el) => {
        if (el.id === draggedId) return;

        const elLeft = el.position.x;
        const elRight = el.position.x + el.size.width;
        const elTop = el.position.y;
        const elBottom = el.position.y + el.size.height;
        const elCenterX = el.position.x + el.size.width / 2;
        const elCenterY = el.position.y + el.size.height / 2;

        const verticalChecks = [
          { value: elLeft, x: elLeft, label: "left" },
          { value: elRight, x: elRight, label: "right" },
          { value: elCenterX, x: elCenterX, label: "center" },
          { value: elRight - draggedBox.width, x: elRight - draggedBox.width, label: "right-match" },
        ];

        verticalChecks.forEach(({ value, x, label }) => {
          const distance = Math.abs(draggedLeft - value);
          if (distance < SNAP_THRESHOLD) {
            pushVertical(x, Math.min(draggedTop, elTop), Math.max(draggedBottom, elBottom), distance, label);
            draggedNode.x(x);
          }
        });

        const horizontalChecks = [
          { value: elTop, y: elTop, label: "top" },
          { value: elBottom, y: elBottom, label: "bottom" },
          { value: elCenterY, y: elCenterY, label: "center" },
          { value: elBottom - draggedBox.height, y: elBottom - draggedBox.height, label: "bottom-match" },
        ];

        horizontalChecks.forEach(({ value, y, label }) => {
          const distance = Math.abs(draggedTop - value);
          if (distance < SNAP_THRESHOLD) {
            pushHorizontal(y, Math.min(draggedLeft, elLeft), Math.max(draggedRight, elRight), distance, label);
            draggedNode.y(y);
          }
        });
      });

      if (verticalCandidates.length > 0) {
        const nearest = verticalCandidates.sort((a, b) => a.distance - b.distance)[0];
        return [nearest.guide, ...newGuides.filter((guide) => guide.orientation === "horizontal")].slice(0, 2);
      }

      if (horizontalCandidates.length > 0) {
        const nearest = horizontalCandidates.sort((a, b) => a.distance - b.distance)[0];
        return [nearest.guide, ...newGuides.filter((guide) => guide.orientation === "vertical")].slice(0, 2);
      }

      return newGuides;
    },
    [canvasHeight, canvasWidth, elements],
  );

  return { getSnapLines };
};
