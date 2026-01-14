"use client";

import React, { useRef, useMemo } from "react";
import { Text, Group, Rect, Line } from "react-konva";
import Konva from "konva";
import { TextElement } from "@/types/editor";
import { useEditorStore } from "@/store/editorStore";

/**
 * Props của TextElement
 */
interface TextElementProps {
  element: TextElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

/**
 * Tính offset dựa trên direction (góc độ)
 */
const calculateOffset = (offset: number, direction: number) => {
  const radians = (direction * Math.PI) / 180;
  return {
    x: Math.cos(radians) * offset,
    y: Math.sin(radians) * offset,
  };
};

/**
 * Component hiển thị Text trên Canvas
 * - Hỗ trợ style cơ bản (font, màu, size...)
 * - Hỗ trợ các hiệu ứng Canva: Shadow, Lift, Hollow, Splice, Outline, Echo, Glitch, Neon, Background
 * - Nền, viền, đổ bóng
 * - Chỉnh sửa văn bản trực tiếp (Double click)
 * - Kéo thả, xoay, animation
 */
const TextElementComponent: React.FC<TextElementProps> = ({
  element,
  onSelect,
  onDragEnd,
  onTransformEnd,
}) => {
  const groupRef = useRef<Konva.Group>(null);
  const textRef = useRef<Konva.Text>(null);
  const { updateElement } = useEditorStore();

  // Lấy giá trị mặc định nếu chưa có
  const padding = element.padding || { top: 0, right: 0, bottom: 0, left: 0 };
  const border = element.border || {
    width: 0,
    color: "#000000",
    style: "solid",
    position: "all",
  };
  const shadow = element.shadow || {
    enabled: false,
    x: 0,
    y: 4,
    blur: 8,
    color: "rgba(0,0,0,0.2)",
  };

  // Text Effect defaults
  const textEffect = element.textEffect || {
    type: "none",
    offset: 50,
    direction: -45,
    blur: 0,
    transparency: 40,
    color: "#000000",
    intensity: 50,
    spread: 50,
    curveAmount: 0,
  };

  // Tính mảng bo góc cho Konva [topLeft, topRight, bottomRight, bottomLeft]
  const cornerRadiusArray = useMemo(() => {
    const br = element.borderRadius || {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0,
    };
    return [br.topLeft, br.topRight, br.bottomRight, br.bottomLeft];
  }, [element.borderRadius]);

  // Tính kiểu nét đứt (dash) cho viền
  const borderDash = useMemo(() => {
    switch (border.style) {
      case "dashed":
        return [10, 5];
      case "dotted":
        return [2, 2];
      default:
        return [];
    }
  }, [border.style]);

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Cast to any to access ctrlKey safely as it might not be present on TouchEvent
    const evt = e.evt as any;
    if ((evt.ctrlKey || evt.metaKey) && element.hyperlink) {
      window.open(element.hyperlink, "_blank");
      return;
    }
    onSelect();
  };

  /**
   * Xử lý double click để sửa văn bản trực tiếp.
   * Tạo một textarea tạm thời đè lên canvas để người dùng nhập liệu.
   */
  const handleDblClick = () => {
    if (!textRef.current || !groupRef.current) return;

    const groupNode = groupRef.current;
    const stage = groupNode.getStage();
    if (!stage) return;

    // Ẩn element trên canvas khi đang sửa
    groupNode.hide();

    // Tính vị trí tương đối so với viewport
    const absPos = groupNode.absolutePosition();
    const stageBox = stage.container().getBoundingClientRect();
    const scale = stage.scaleX();

    // Tạo và thêm textarea vào DOM
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    // Style textarea giống hệt text element
    textarea.value = element.content;
    textarea.style.position = "absolute";
    textarea.style.top = `${stageBox.top + absPos.y * scale}px`;
    textarea.style.left = `${stageBox.left + absPos.x * scale}px`;
    textarea.style.width = `${element.size.width * scale}px`;
    textarea.style.height = `${element.size.height * scale}px`;
    textarea.style.fontSize = `${element.fontSize * scale}px`;
    textarea.style.fontFamily = element.fontFamily;
    textarea.style.fontWeight = String(element.fontWeight);
    textarea.style.fontStyle = element.fontStyle;
    textarea.style.color = element.color;
    textarea.style.textAlign = element.textAlign;
    textarea.style.border = "2px solid #ec4899"; // Viền hồng để biết đang sửa
    textarea.style.padding = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
    textarea.style.margin = "0px";
    textarea.style.overflow = "hidden";
    textarea.style.background =
      element.backgroundColor === "transparent"
        ? "rgba(255,255,255,0.9)"
        : element.backgroundColor;
    textarea.style.outline = "none";
    textarea.style.resize = "none";
    textarea.style.lineHeight = String(element.lineHeight);
    textarea.style.letterSpacing = `${element.letterSpacing}px`;
    textarea.style.transformOrigin = "left top";
    textarea.style.transform = `rotate(${element.rotation}deg)`;
    textarea.style.zIndex = "1000";
    textarea.style.boxSizing = "border-box";

    // Focus và chọn toàn bộ text để sửa ngay
    textarea.focus();
    textarea.select();

    // Hàm dọn dẹp: Xóa textarea và hiện lại text gốc
    const removeTextarea = () => {
      textarea.remove();
      groupNode.show();
      stage.batchDraw();
    };

    // Lưu khi blur
    textarea.addEventListener("blur", () => {
      updateElement(element.id, { content: textarea.value });
      removeTextarea();
    });

    // Lưu khi nhấn Enter (trừ khi giữ Shift), Hủy khi nhấn Escape
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        removeTextarea();
      }
      if (e.key === "Enter" && !e.shiftKey) {
        updateElement(element.id, { content: textarea.value });
        removeTextarea();
      }
    });
  };

  // Kiểm tra xem có cần hiển thị nền không
  // Xác định xem box element (nền/viền) có hiển thị không
  const hasBackground =
    element.backgroundColor && element.backgroundColor !== "transparent";
  const hasBorder = border.width > 0 && border.style !== "none";
  const hasShadow = shadow.enabled;

  /**
   * Logic đổ bóng:
   * - Nếu khung có nền hoặc viền: Đổ bóng cho khung (Box Shadow).
   * - Nếu khung trong suốt: Đổ bóng cho chữ (Text Shadow).
   */
  const applyShadowToBox = hasShadow && (hasBackground || hasBorder);
  const applyShadowToText = hasShadow && !hasBackground && !hasBorder;

  // Tính tổng kích thước bao gồm padding
  const totalWidth = element.size.width + padding.left + padding.right;
  const totalHeight = element.size.height + padding.top + padding.bottom;

  // Vùng nội dung (nơi chứa text) = kích thước gốc của element
  const contentWidth = element.size.width;
  const contentHeight = element.size.height;

  // Text được đặt tại vị trí padding
  // Thuộc tính align xử lý căn lề ngang/dọc bên trong text box
  const textX = padding.left;
  const textY = padding.top;

  // Base text style
  const baseTextStyle =
    `${element.fontWeight >= 700 ? "bold" : ""} ${
      element.fontStyle === "italic" ? "italic" : ""
    }`.trim() || "normal";

  const baseTextDecoration =
    element.textDecoration !== "none" ? element.textDecoration : "";

  /**
   * Render các hiệu ứng text theo loại
   * Mỗi hiệu ứng render các layer text khác nhau
   */
  const renderTextEffects = () => {
    const effectOffset = calculateOffset(
      textEffect.offset,
      textEffect.direction
    );
    const effectOpacity = 1 - textEffect.transparency / 100;

    // Base text component props
    const baseTextProps = {
      width: contentWidth,
      height: contentHeight,
      text: element.content,
      fontFamily: element.fontFamily,
      fontSize: element.fontSize,
      fontStyle: baseTextStyle,
      textDecoration: baseTextDecoration,
      align: element.textAlign as "left" | "center" | "right",
      verticalAlign: "middle" as const,
      lineHeight: element.lineHeight,
      letterSpacing: element.letterSpacing,
      wrap: "word" as const,
    };

    switch (textEffect.type) {
      case "shadow":
        const shadowOffsetScale = textEffect.offset / 50;
        const shadowOffset = calculateOffset(
          shadowOffsetScale,
          textEffect.direction
        );
        const scaledBlur = textEffect.blur / 20;
        return (
          <Text
            ref={textRef}
            {...baseTextProps}
            x={textX}
            y={textY}
            fill={element.color}
            shadowEnabled={true}
            shadowColor={textEffect.color}
            shadowBlur={scaledBlur}
            shadowOffsetX={shadowOffset.x}
            shadowOffsetY={shadowOffset.y}
            shadowOpacity={effectOpacity}
          />
        );

      case "lift":
        const liftIntensity = textEffect.intensity / 100;
        const liftBlur = 1 + liftIntensity * 5;
        const liftYOffset = 0;
        const liftShadowOpacity = 0.3 + liftIntensity * 0.7;
        return (
          <Text
            ref={textRef}
            {...baseTextProps}
            x={textX}
            y={textY}
            fill={element.color}
            shadowEnabled={true}
            shadowColor="rgba(0,0,0,0.6)"
            shadowBlur={liftBlur}
            shadowOffsetX={0}
            shadowOffsetY={liftYOffset}
            shadowOpacity={liftShadowOpacity}
          />
        );

      case "hollow":
        const hollowScale = Math.max(0.3, element.fontSize / 60);
        const hollowStroke = (0.5 + textEffect.intensity / 40) * hollowScale;
        return (
          <Text
            ref={textRef}
            {...baseTextProps}
            x={textX}
            y={textY}
            fill="transparent"
            stroke={element.color}
            strokeWidth={hollowStroke}
          />
        );

      case "splice":
        // Thickness: scale with fontSize like Hollow - áp dụng cho chữ chính
        const spliceScale = Math.max(0.3, element.fontSize / 60);
        const spliceStroke = (0.5 + textEffect.intensity / 40) * spliceScale;
        // Offset & Direction: scale like Shadow - áp dụng cho chữ phụ
        const spliceOffsetScale = textEffect.offset / 50;
        const spliceOffset = calculateOffset(
          spliceOffsetScale,
          textEffect.direction
        );
        return (
          <>
            {/* Chữ offset phía sau - chỉ fill màu, offset, direction */}
            <Text
              {...baseTextProps}
              x={textX + spliceOffset.x}
              y={textY + spliceOffset.y}
              fill={textEffect.color}
              opacity={effectOpacity}
            />
            {/* Chữ chính phía trước - có stroke (Thickness) */}
            <Text
              ref={textRef}
              {...baseTextProps}
              x={textX}
              y={textY}
              fill="transparent"
              stroke={element.color}
              strokeWidth={spliceStroke}
            />
          </>
        );

      case "outline":
        const outlineScale = Math.max(0.3, element.fontSize / 60);
        const outlineStroke = (0.8 + textEffect.intensity / 25) * outlineScale;
        return (
          <>
            <Text
              {...baseTextProps}
              x={textX}
              y={textY}
              fill="transparent"
              stroke={textEffect.color}
              strokeWidth={outlineStroke}
            />
            <Text
              ref={textRef}
              {...baseTextProps}
              x={textX}
              y={textY}
              fill={element.color}
            />
          </>
        );

      case "echo":
        const echoOffsetScale = textEffect.offset / 50;
        const echoOffset = calculateOffset(
          echoOffsetScale,
          textEffect.direction
        );
        return (
          <>
            {[2, 1].map((i) => (
              <Text
                key={i}
                {...baseTextProps}
                x={textX + echoOffset.x * i}
                y={textY + echoOffset.y * i}
                fill={element.color}
                opacity={effectOpacity * (0.4 / i)}
              />
            ))}
            <Text
              ref={textRef}
              {...baseTextProps}
              x={textX}
              y={textY}
              fill={element.color}
            />
          </>
        );

      case "glitch":
        const glitchOffsetScale = textEffect.offset / 50;
        const glitchOffset = calculateOffset(
          glitchOffsetScale,
          textEffect.direction
        );
        return (
          <>
            <Text
              {...baseTextProps}
              x={textX - glitchOffset.x}
              y={textY - glitchOffset.y}
              fill="rgba(255,0,0,0.7)"
              opacity={effectOpacity}
            />
            {/* Blue channel - positive offset */}
            <Text
              {...baseTextProps}
              x={textX + glitchOffset.x}
              y={textY + glitchOffset.y}
              fill="rgba(0,0,255,0.7)"
              opacity={effectOpacity}
            />
            {/* Main text */}
            <Text
              ref={textRef}
              {...baseTextProps}
              x={textX}
              y={textY}
              fill={element.color}
            />
          </>
        );

      case "neon":
        const neonIntensity = textEffect.intensity / 100;
        const r = Math.round(neonIntensity * 255);
        const g = Math.round(neonIntensity * 255);
        const b = Math.round(neonIntensity * 255);
        const interpolatedColor = `rgb(${r},${g},${b})`;

        return (
          <>
            {[4, 3, 2, 1].map((i) => (
              <Text
                key={i}
                {...baseTextProps}
                x={textX}
                y={textY}
                fill={textEffect.color}
                opacity={effectOpacity * (0.2 / i)}
                shadowEnabled={true}
                shadowBlur={textEffect.blur * i + 5}
                shadowColor={textEffect.color}
              />
            ))}
            <Text
              ref={textRef}
              {...baseTextProps}
              x={textX}
              y={textY}
              fill={interpolatedColor}
              shadowEnabled={true}
              shadowBlur={textEffect.blur + 10}
              shadowColor={textEffect.color}
            />
          </>
        );

      case "curve":
        return (
          <Text
            ref={textRef}
            {...baseTextProps}
            x={textX}
            y={textY}
            fill={element.color}
            shadowEnabled={applyShadowToText}
            shadowColor={applyShadowToText ? shadow.color : undefined}
            shadowBlur={applyShadowToText ? shadow.blur : 0}
            shadowOffsetX={applyShadowToText ? shadow.x : 0}
            shadowOffsetY={applyShadowToText ? shadow.y : 0}
          />
        );

      case "none":
      default:
        return (
          <Text
            ref={textRef}
            x={textX}
            y={textY}
            width={contentWidth}
            height={contentHeight}
            text={element.content}
            fontFamily={element.fontFamily}
            fontSize={element.fontSize}
            fontStyle={baseTextStyle}
            textDecoration={baseTextDecoration}
            fill={element.color}
            align={element.textAlign}
            verticalAlign="middle"
            lineHeight={element.lineHeight}
            letterSpacing={element.letterSpacing}
            wrap="word"
            shadowEnabled={applyShadowToText}
            shadowColor={applyShadowToText ? shadow.color : undefined}
            shadowBlur={applyShadowToText ? shadow.blur : 0}
            shadowOffsetX={applyShadowToText ? shadow.x : 0}
            shadowOffsetY={applyShadowToText ? shadow.y : 0}
          />
        );
    }
  };

  // Xử lý Hiệu ứng (Animation)
  React.useEffect(() => {
    const node = groupRef.current;
    if (!node) return;

    // Reset trạng thái ban đầu
    node.opacity(element.opacity);
    node.scale({ x: 1, y: 1 });
    node.rotation(element.rotation);
    node.position(element.position);

    const animConfig = element.animation;
    if (!animConfig || !animConfig.enabled || animConfig.type === "none") {
      return;
    }

    let anim: Konva.Animation | null = null;
    let tween: Konva.Tween | null = null;

    // Hiệu ứng xuất hiện (Chạy 1 lần)
    if (!animConfig.continuous) {
      switch (animConfig.type) {
        case "fadeIn":
          node.opacity(0);
          tween = new Konva.Tween({
            node: node,
            opacity: element.opacity,
            duration: 1,
            easing: Konva.Easings.EaseInOut,
          });
          tween.play();
          break;
        case "slideIn":
          const originalY = element.position.y;
          node.y(originalY + 50);
          node.opacity(0);
          tween = new Konva.Tween({
            node: node,
            y: originalY,
            opacity: element.opacity,
            duration: 0.8,
            easing: Konva.Easings.BackEaseOut,
          });
          tween.play();
          break;
        case "zoom":
          node.scale({ x: 0, y: 0 });
          tween = new Konva.Tween({
            node: node,
            scaleX: 1,
            scaleY: 1,
            duration: 0.6,
            easing: Konva.Easings.BackEaseOut,
          });
          tween.play();
          break;
        case "bounce":
          const startY = element.position.y;
          node.y(startY - 30);
          tween = new Konva.Tween({
            node: node,
            y: startY,
            duration: 1,
            easing: Konva.Easings.BounceEaseOut,
          });
          tween.play();
          break;
      }
    } else {
      // Hiệu ứng liên tục (Lặp lại)
      switch (animConfig.type) {
        case "pulse":
          anim = new Konva.Animation((frame) => {
            if (!frame) return;
            const scale = 1 + Math.sin(frame.time * 0.005) * 0.05;
            node.scale({ x: scale, y: scale });
          }, node.getLayer());
          anim.start();
          break;
        case "shake":
          const baseRot = element.rotation;
          anim = new Konva.Animation((frame) => {
            if (!frame) return;
            const rot = baseRot + Math.sin(frame.time * 0.01) * 5;
            node.rotation(rot);
          }, node.getLayer());
          anim.start();
          break;
        case "bounce":
          const baseY = element.position.y;
          anim = new Konva.Animation((frame) => {
            if (!frame) return;
            const y = baseY + Math.sin(frame.time * 0.005) * 10;
            node.y(y);
          }, node.getLayer());
          anim.start();
          break;
        case "fadeIn":
          anim = new Konva.Animation((frame) => {
            if (!frame) return;
            const mobileOpacity =
              element.opacity *
              (0.5 + Math.abs(Math.sin(frame.time * 0.002)) * 0.5);
            node.opacity(mobileOpacity);
          }, node.getLayer());
          anim.start();
          break;
      }
    }

    return () => {
      if (anim) anim.stop();
      if (tween) tween.destroy();
      // Reset trạng thái khi cleanup
      if (node) {
        node.opacity(element.opacity);
        node.scale({ x: 1, y: 1 });
        node.rotation(element.rotation);
        node.position(element.position);
      }
    };
  }, [element.animation, element.position, element.rotation, element.opacity]);

  return (
    <Group
      id={element.id}
      ref={groupRef}
      x={element.position.x}
      y={element.position.y}
      width={totalWidth}
      height={totalHeight}
      rotation={element.rotation}
      opacity={element.opacity}
      draggable={!element.locked}
      onClick={handleClick}
      onTap={handleClick}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    >
      <Rect
        x={0}
        y={0}
        width={totalWidth}
        height={totalHeight}
        fill={hasBackground ? element.backgroundColor : "transparent"}
        cornerRadius={cornerRadiusArray}
        stroke={
          hasBorder && border.position === "all" ? border.color : undefined
        }
        strokeWidth={hasBorder && border.position === "all" ? border.width : 0}
        dash={borderDash}
        shadowEnabled={applyShadowToBox}
        shadowColor={applyShadowToBox ? shadow.color : undefined}
        shadowBlur={applyShadowToBox ? shadow.blur : 0}
        shadowOffsetX={applyShadowToBox ? shadow.x : 0}
        shadowOffsetY={applyShadowToBox ? shadow.y : 0}
      />

      {hasBorder && border.position === "top" && (
        <Line
          points={[0, 0, totalWidth, 0]}
          stroke={border.color}
          strokeWidth={border.width}
          dash={borderDash}
        />
      )}
      {hasBorder && border.position === "bottom" && (
        <Line
          points={[0, totalHeight, totalWidth, totalHeight]}
          stroke={border.color}
          strokeWidth={border.width}
          dash={borderDash}
        />
      )}
      {hasBorder && border.position === "left" && (
        <Line
          points={[0, 0, 0, totalHeight]}
          stroke={border.color}
          strokeWidth={border.width}
          dash={borderDash}
        />
      )}
      {hasBorder && border.position === "right" && (
        <Line
          points={[totalWidth, 0, totalWidth, totalHeight]}
          stroke={border.color}
          strokeWidth={border.width}
          dash={borderDash}
        />
      )}

      {renderTextEffects()}
    </Group>
  );
};

export default TextElementComponent;
