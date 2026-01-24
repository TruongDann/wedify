import { useState, useRef, useCallback } from "react";
import Konva from "konva";
import { EditorElement } from "@/types/editor";

export interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  startX: number;
  startY: number;
}

interface UseMarqueeSelectionProps {
  elements: EditorElement[];
  onSelectElement: (id: string | null) => void;
  onSelectElements: (ids: string[]) => void;
}

export const useMarqueeSelection = ({
  elements,
  onSelectElement,
  onSelectElements,
}: UseMarqueeSelectionProps) => {
  const [selectionBox, setSelectionBox] = useState<SelectionBox>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    visible: false,
    startX: 0,
    startY: 0,
  });
  const isSelecting = useRef(false);

  const isElementInSelectionBox = useCallback(
    (element: EditorElement, box: SelectionBox) => {
      const elLeft = element.position.x;
      const elTop = element.position.y;
      const elRight = element.position.x + element.size.width;
      const elBottom = element.position.y + element.size.height;

      const boxLeft = Math.min(box.x, box.x + box.width);
      const boxTop = Math.min(box.y, box.y + box.height);
      const boxRight = Math.max(box.x, box.x + box.width);
      const boxBottom = Math.max(box.y, box.y + box.height);

      return !(
        elRight < boxLeft ||
        elLeft > boxRight ||
        elBottom < boxTop ||
        elTop > boxBottom
      );
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (
        e.target === e.target.getStage() ||
        e.target.name() === "background"
      ) {
        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        isSelecting.current = true;
        setSelectionBox({
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          visible: true,
          startX: pos.x,
          startY: pos.y,
        });

        onSelectElement(null);
      }
    },
    [onSelectElement]
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isSelecting.current) return;

      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      setSelectionBox((prev) => ({
        ...prev,
        x: Math.min(pos.x, prev.startX),
        y: Math.min(pos.y, prev.startY),
        width: Math.abs(pos.x - prev.startX),
        height: Math.abs(pos.y - prev.startY),
      }));
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    if (!isSelecting.current) return;

    isSelecting.current = false;

    if (selectionBox.width > 5 || selectionBox.height > 5) {
      const selectedIds = elements
        .filter((el) => isElementInSelectionBox(el, selectionBox))
        .map((el) => el.id);

      if (selectedIds.length > 0) {
        onSelectElements(selectedIds);
      }
    }

    setSelectionBox((prev) => ({
      ...prev,
      visible: false,
      width: 0,
      height: 0,
    }));
  }, [elements, selectionBox, isElementInSelectionBox, onSelectElements]);

  return {
    selectionBox,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
