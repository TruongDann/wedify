import React from "react";
import Konva from "konva";
import type { ElementAnimation, Position } from "@/types/editor";
import { DEFAULT_APPEAR_DURATION } from "@/constants/animation";

const SLIDE_DISTANCE = 50;

interface AnimatedElement {
  animation?: ElementAnimation;
  position: Position;
  rotation: number;
  opacity: number;
}

/**
 * Chạy thử hiệu ứng của phần tử trên canvas Konva mỗi khi cấu hình đổi.
 * Trang xem thiệp dùng CSS tương ứng trong components/card/ElementFrame.tsx.
 */
export const useElementAnimation = (
  nodeRef: React.RefObject<Konva.Node | null>,
  element: AnimatedElement,
  ready = true,
) => {
  const { animation, position, rotation, opacity } = element;
  // So sánh cấu hình theo giá trị: object animation đổi tham chiếu sau mỗi lần cập nhật store
  const animationKey = JSON.stringify(animation);

  React.useEffect(() => {
    const node = nodeRef.current;
    if (!node || !ready) return;

    const reset = () => {
      node.opacity(opacity);
      node.scale({ x: 1, y: 1 });
      node.rotation(rotation);
      node.position(position);
    };
    reset();

    if (!animation || !animation.enabled || animation.type === "none") return;

    let anim: Konva.Animation | null = null;
    let tween: Konva.Tween | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (!animation.continuous) {
      const duration =
        animation.duration ?? DEFAULT_APPEAR_DURATION[animation.type] ?? 1;
      const to: Konva.NodeConfig = {};
      let easing = Konva.Easings.EaseOut;

      switch (animation.type) {
        case "fadeIn":
          node.opacity(0);
          to.opacity = opacity;
          easing = Konva.Easings.EaseInOut;
          break;
        case "slideIn":
          node.y(position.y + SLIDE_DISTANCE);
          node.opacity(0);
          Object.assign(to, { y: position.y, opacity });
          easing = Konva.Easings.BackEaseOut;
          break;
        case "slideUp":
        case "slideDown":
          node.y(
            position.y +
              (animation.type === "slideUp" ? SLIDE_DISTANCE : -SLIDE_DISTANCE),
          );
          node.opacity(0);
          Object.assign(to, { y: position.y, opacity });
          break;
        case "slideLeft":
        case "slideRight":
          node.x(
            position.x +
              (animation.type === "slideLeft" ? SLIDE_DISTANCE : -SLIDE_DISTANCE),
          );
          node.opacity(0);
          Object.assign(to, { x: position.x, opacity });
          break;
        case "zoom":
          node.scale({ x: 0, y: 0 });
          Object.assign(to, { scaleX: 1, scaleY: 1 });
          easing = Konva.Easings.BackEaseOut;
          break;
        case "bounce":
          node.y(position.y - 30);
          to.y = position.y;
          easing = Konva.Easings.BounceEaseOut;
          break;
      }

      tween = new Konva.Tween({ node, duration, easing, ...to });
      timer = setTimeout(() => tween?.play(), (animation.delay ?? 0) * 1000);
    } else {
      const layer = node.getLayer();
      switch (animation.type) {
        case "pulse":
          anim = new Konva.Animation((frame) => {
            if (!frame) return;
            const scale = 1 + Math.sin(frame.time * 0.005) * 0.05;
            node.scale({ x: scale, y: scale });
          }, layer);
          break;
        case "shake":
          anim = new Konva.Animation((frame) => {
            if (!frame) return;
            node.rotation(rotation + Math.sin(frame.time * 0.01) * 5);
          }, layer);
          break;
        case "bounce":
          anim = new Konva.Animation((frame) => {
            if (!frame) return;
            node.y(position.y + Math.sin(frame.time * 0.005) * 10);
          }, layer);
          break;
        case "fadeIn":
          anim = new Konva.Animation((frame) => {
            if (!frame) return;
            node.opacity(
              opacity * (0.5 + Math.abs(Math.sin(frame.time * 0.002)) * 0.5),
            );
          }, layer);
          break;
      }
      anim?.start();
    }

    return () => {
      if (timer) clearTimeout(timer);
      anim?.stop();
      tween?.destroy();
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animation/position được so qua animationKey và x/y
  }, [ready, animationKey, position.x, position.y, rotation, opacity]);
};
