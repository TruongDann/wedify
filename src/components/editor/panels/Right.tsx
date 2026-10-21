"use client";

import React, { useState, useCallback } from "react";
import { App, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useEditorStore } from "@/store/editorStore";
import {
  TextElement,
  ImageElement,
  ShapeElement,
  WidgetElement,
  ToolElement,
  EditorElement,
} from "@/types/editor";

// Import extracted components
import {
  TextStyleSection,
  PaddingSection,
  BorderSection,
  ShadowSection,
  PositionSection,
} from "./right/TextPropertySections";

import { TextEffectSection } from "./right/TextEffectSection";

import {
  ImageActionSection,
  ImageFilterSection,
  ImagePaddingSection,
  ImageBorderSection,
  ImageShadowSection,
  ImagePositionSection,
  DeleteButton,
} from "./right/ImagePropertySections";

import {
  ShapeColorSection,
  ShapeShadowSection,
  ShapePositionSection,
  ShapeDeleteButton,
} from "./right/ShapePropertySections";

import { AnimationSection, ClickActionSection } from "../shared";
import {
  WidgetStyleSection,
  WidgetRsvpSection,
  WidgetMapSection,
} from "./right/WidgetPropertySections";
import { ToolSettingsSection } from "./right/ToolPropertySections";
import {
  WidgetButtonSection,
  WidgetMediaSection,
  WidgetGiftSection,
} from "./right/WidgetMoreSections";
import { PageSettings } from "./right/PageSettingsSection";
import { MusicPropertySection } from "./right/MusicPropertySection";
import { CropModal } from "./right/CropModal";

// ==================== Types ====================

interface RightProps {
  activeTab?: string;
  cardTitle?: string;
  cardCategory?: string;
  cardStatus?: string;
  previewImage?: string;
  onTitleChange?: (title: string) => void;
  onCategoryChange?: (category: string) => void;
  onStatusChange?: (status: string) => void;
  onPreviewImageChange?: (image: string) => void;
  onSwitchToImageTab?: () => void;
}

// ==================== Main Component ====================

const Right: React.FC<RightProps> = ({
  activeTab,
  cardTitle = "Thiệp cưới của tôi",
  cardCategory = "wedding",
  cardStatus = "draft",
  previewImage = "",
  onTitleChange,
  onCategoryChange,
  onStatusChange,
  onPreviewImageChange,
  onSwitchToImageTab,
}) => {
  const { elements, selectedElementId, updateElement, deleteElement } =
    useEditorStore();

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "textEffect",
    "style",
    "padding",
    "border",
    "borderRadius",
    "shadow",
    "link",
    "animation",
    "position",
    "colors",
    "imageColors",
    "imagePadding",
    "imageBorder",
    "imageShadow",
    "imageLink",
    "imageAnimation",
    "imagePosition",
    "cardInfo",
    "canvasSize",
    "background",
    "grid",
    "music",
    "widgetStyle",
    "widgetRsvp",
    "widgetMap",
    "widgetButton",
    "widgetMedia",
    "widgetGift",
    "viewerDisplay",
    "viewerInteraction",
  ]);

  // Sync toggles
  const { message } = App.useApp();
  const [paddingLinked, setPaddingLinked] = useState(true);
  const [borderRadiusLinked, setBorderRadiusLinked] = useState(true);
  const [sizeLinked, setSizeLinked] = useState(true);

  // Crop modal state
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  // ==================== Handlers ====================

  const toggleSection = (key: string) => {
    setExpandedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleUpdate = (updates: Partial<EditorElement>) => {
    if (selectedElement) {
      updateElement(selectedElement.id, updates);
    }
  };

  const handlePositionUpdate = (key: "x" | "y", value: number) => {
    if (selectedElement) {
      updateElement(selectedElement.id, {
        position: { ...selectedElement.position, [key]: value },
      });
    }
  };

  const handleSizeUpdate = (key: "width" | "height", value: number) => {
    if (selectedElement) {
      updateElement(selectedElement.id, {
        size: { ...selectedElement.size, [key]: value },
      });
    }
  };

  // Crop modal handlers
  const openCropModal = useCallback((imageSrc: string) => {
    setCropImageSrc(imageSrc);
    setIsCropModalOpen(true);
  }, []);

  const handleCropComplete = useCallback(
    (croppedImageUrl: string) => {
      if (selectedElement) {
        updateElement(selectedElement.id, { src: croppedImageUrl });
      }
      setIsCropModalOpen(false);
    },
    [selectedElement, updateElement],
  );

  // ==================== Render Functions ====================

  const renderTextProperties = (element: TextElement) => {
    const border = element.border || {
      width: 0,
      color: "#000000",
      style: "solid" as const,
      position: "all" as const,
    };
    const borderRadius = element.borderRadius || {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0,
    };
    const shadow = element.shadow || {
      enabled: false,
      x: 0,
      y: 4,
      blur: 8,
      color: "rgba(0,0,0,0.2)",
    };

    return (
      <div className="p-4 space-y-3">
        <TextEffectSection
          element={element}
          isExpanded={expandedSections.includes("textEffect")}
          onToggle={toggleSection}
          onUpdate={handleUpdate}
        />

        <TextStyleSection
          element={element}
          isExpanded={expandedSections.includes("style")}
          onToggle={toggleSection}
          onUpdate={handleUpdate}
        />

        <PaddingSection
          element={element}
          isExpanded={expandedSections.includes("padding")}
          onToggle={toggleSection}
          onUpdate={handleUpdate}
          paddingLinked={paddingLinked}
          setPaddingLinked={setPaddingLinked}
        />

        <BorderSection
          border={border}
          borderRadius={borderRadius}
          isExpanded={expandedSections.includes("border")}
          onToggle={toggleSection}
          onUpdate={handleUpdate}
          borderRadiusLinked={borderRadiusLinked}
          setBorderRadiusLinked={setBorderRadiusLinked}
        />

        <ShadowSection
          shadow={shadow}
          isExpanded={expandedSections.includes("shadow")}
          onToggle={toggleSection}
          onUpdate={(updates) => handleUpdate(updates)}
        />

        <ClickActionSection
          element={element}
          elements={elements}
          sectionKey="link"
          isExpanded={expandedSections.includes("link")}
          onToggle={toggleSection}
          onChange={handleUpdate}
        />

        <AnimationSection
          animation={element.animation}
          sectionKey="animation"
          isExpanded={expandedSections.includes("animation")}
          onToggle={toggleSection}
          onChange={(animation) => handleUpdate({ animation })}
        />

        <PositionSection
          position={{ x: element.position.x, y: element.position.y }}
          size={{ width: element.size.width, height: element.size.height }}
          rotation={element.rotation}
          isExpanded={expandedSections.includes("position")}
          onToggle={toggleSection}
          onPositionChange={handlePositionUpdate}
          onSizeChange={handleSizeUpdate}
          onRotationChange={(value) => handleUpdate({ rotation: value })}
        />

        <div className="pt-1">
          <Button
            danger
            block
            icon={<DeleteOutlined />}
            onClick={() => selectedElement && deleteElement(selectedElement.id)}
          >
            Xóa phần tử
          </Button>
        </div>
      </div>
    );
  };

  const renderImageProperties = (element: ImageElement) => {
    const filters = element.filters || {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
    };
    const padding = element.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    const border = element.border || {
      width: 0,
      color: "#000000",
      style: "solid" as const,
      position: "all" as const,
    };
    const borderRadius = element.borderRadius || {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0,
    };
    const shadow = element.shadow || {
      enabled: false,
      x: 0,
      y: 4,
      blur: 8,
      color: "rgba(0,0,0,0.2)",
    };

    return (
      <div className="p-4 space-y-3">
        <ImageActionSection
          objectFit={element.objectFit}
          onObjectFitChange={(objectFit) => handleUpdate({ objectFit })}
          onCropImage={() => openCropModal(element.src)}
          onSwitchToImageTab={onSwitchToImageTab || (() => {})}
        />

        <ImageFilterSection
          filters={filters}
          opacity={element.opacity}
          expandedSections={expandedSections}
          onToggle={toggleSection}
          onUpdate={handleUpdate}
        />

        <ImagePaddingSection
          padding={padding}
          paddingLinked={paddingLinked}
          expandedSections={expandedSections}
          onToggle={toggleSection}
          onUpdate={handleUpdate}
          onTogglePaddingLinked={() => setPaddingLinked(!paddingLinked)}
        />

        <ImageBorderSection
          border={border}
          borderRadius={borderRadius}
          borderRadiusLinked={borderRadiusLinked}
          expandedSections={expandedSections}
          onToggle={toggleSection}
          onUpdate={handleUpdate}
          onToggleBorderRadiusLinked={() =>
            setBorderRadiusLinked(!borderRadiusLinked)
          }
        />

        <ImageShadowSection
          shadow={shadow}
          expandedSections={expandedSections}
          onToggle={toggleSection}
          onUpdate={handleUpdate}
        />

        <ClickActionSection
          element={element}
          elements={elements}
          sectionKey="imageLink"
          isExpanded={expandedSections.includes("imageLink")}
          onToggle={toggleSection}
          onChange={handleUpdate}
        />

        <AnimationSection
          animation={element.animation}
          sectionKey="imageAnimation"
          isExpanded={expandedSections.includes("imageAnimation")}
          onToggle={toggleSection}
          onChange={(animation) => handleUpdate({ animation })}
        />

        <ImagePositionSection
          element={element}
          expandedSections={expandedSections}
          onToggle={toggleSection}
          onUpdate={handleUpdate}
          onPositionUpdate={handlePositionUpdate}
          onSizeUpdate={handleSizeUpdate}
        />

        <DeleteButton
          onDelete={() => selectedElement && deleteElement(selectedElement.id)}
        />
      </div>
    );
  };

  const renderShapeProperties = (element: ShapeElement) => {
    const shadow = element.shadow || {
      enabled: false,
      x: 0,
      y: 4,
      blur: 8,
      color: "rgba(0,0,0,0.2)",
    };

    return (
      <div className="p-4 space-y-3">
        <ShapeColorSection
          element={element}
          expandedSections={expandedSections}
          onToggle={toggleSection}
          onUpdate={handleUpdate}
        />

        <ShapeShadowSection
          shadow={shadow}
          expandedSections={expandedSections}
          onToggle={toggleSection}
          onUpdate={handleUpdate}
        />

        <AnimationSection
          animation={element.animation}
          sectionKey="animation"
          isExpanded={expandedSections.includes("animation")}
          onToggle={toggleSection}
          onChange={(animation) => handleUpdate({ animation })}
        />

        <ClickActionSection
          element={element}
          elements={elements}
          sectionKey="link"
          isExpanded={expandedSections.includes("link")}
          onToggle={toggleSection}
          onChange={handleUpdate}
        />

        <ShapePositionSection
          element={element}
          expandedSections={expandedSections}
          onToggle={toggleSection}
          onUpdate={handleUpdate}
          onPositionUpdate={handlePositionUpdate}
          onSizeUpdate={handleSizeUpdate}
        />

        <ShapeDeleteButton
          onDelete={() => selectedElement && deleteElement(selectedElement.id)}
        />
      </div>
    );
  };

  const renderWidgetProperties = (element: WidgetElement) => {
    const sectionProps = {
      element,
      onToggle: toggleSection,
      onUpdate: handleUpdate as (updates: Partial<WidgetElement>) => void,
    };
    return (
      <div className="p-4 space-y-3">
        <WidgetStyleSection
          {...sectionProps}
          isExpanded={expandedSections.includes("widgetStyle")}
        />
        {element.widget === "rsvp" && (
          <WidgetRsvpSection
            {...sectionProps}
            isExpanded={expandedSections.includes("widgetRsvp")}
          />
        )}
        {element.widget === "map" && (
          <WidgetMapSection
            {...sectionProps}
            isExpanded={expandedSections.includes("widgetMap")}
          />
        )}
        {(element.widget === "call" || element.widget === "reminder") && (
          <WidgetButtonSection
            {...sectionProps}
            isExpanded={expandedSections.includes("widgetButton")}
          />
        )}
        {["youtube", "slideshow", "album"].includes(element.widget) && (
          <WidgetMediaSection
            {...sectionProps}
            isExpanded={expandedSections.includes("widgetMedia")}
          />
        )}
        {element.widget === "giftQr" && (
          <WidgetGiftSection
            {...sectionProps}
            isExpanded={expandedSections.includes("widgetGift")}
          />
        )}

        <AnimationSection
          animation={element.animation}
          sectionKey="animation"
          isExpanded={expandedSections.includes("animation")}
          onToggle={toggleSection}
          onChange={(animation) => handleUpdate({ animation })}
        />

        <PositionSection
          position={{ x: element.position.x, y: element.position.y }}
          size={{ width: element.size.width, height: element.size.height }}
          rotation={element.rotation}
          isExpanded={expandedSections.includes("position")}
          onToggle={toggleSection}
          onPositionChange={handlePositionUpdate}
          onSizeChange={handleSizeUpdate}
          onRotationChange={(value) => handleUpdate({ rotation: value })}
        />

        <DeleteButton
          onDelete={() => selectedElement && deleteElement(selectedElement.id)}
        />
      </div>
    );
  };

  const renderToolProperties = (element: ToolElement) => (
    <div className="p-4 space-y-3">
      <ToolSettingsSection
        element={element}
        onUpdate={handleUpdate as (updates: Partial<ToolElement>) => void}
        onError={(text) => message.error(text)}
      />

      <AnimationSection
        animation={element.animation}
        sectionKey="animation"
        isExpanded={expandedSections.includes("animation")}
        onToggle={toggleSection}
        onChange={(animation) => handleUpdate({ animation })}
      />

      <PositionSection
        position={{ x: element.position.x, y: element.position.y }}
        size={{ width: element.size.width, height: element.size.height }}
        rotation={element.rotation}
        isExpanded={expandedSections.includes("position")}
        onToggle={toggleSection}
        onPositionChange={handlePositionUpdate}
        onSizeChange={handleSizeUpdate}
        onRotationChange={(value) => handleUpdate({ rotation: value })}
      />

      <DeleteButton
        onDelete={() => selectedElement && deleteElement(selectedElement.id)}
      />
    </div>
  );

  const renderPageSettings = () => (
    <PageSettings
      cardTitle={cardTitle}
      cardCategory={cardCategory}
      cardStatus={cardStatus}
      previewImage={previewImage}
      onTitleChange={onTitleChange}
      onCategoryChange={onCategoryChange}
      onStatusChange={onStatusChange}
      onPreviewImageChange={onPreviewImageChange}
      expandedSections={expandedSections}
      onToggle={toggleSection}
      sizeLinked={sizeLinked}
      onToggleSizeLinked={() => setSizeLinked(!sizeLinked)}
    />
  );

  const renderMusicSettings = () => <MusicPropertySection />;

  const renderProperties = () => {
    // If music tab is active, always show music settings (regardless of element selection)
    if (activeTab === "music") {
      return renderMusicSettings();
    }

    if (!selectedElement) return renderPageSettings();

    switch (selectedElement.type) {
      case "text":
        return renderTextProperties(selectedElement as TextElement);
      case "image":
        return renderImageProperties(selectedElement as ImageElement);
      case "shape":
        return renderShapeProperties(selectedElement as ShapeElement);
      case "widget":
        return renderWidgetProperties(selectedElement);
      case "tool":
        return renderToolProperties(selectedElement as ToolElement);
      default:
        return renderPageSettings();
    }
  };

  // Tiêu đề panel theo ngữ cảnh: eyebrow nhỏ + tiêu đề chính
  const ELEMENT_TITLES: Record<EditorElement["type"], string> = {
    text: "Văn bản",
    image: "Hình ảnh",
    shape: "Hình dạng",
    sticker: "Sticker",
    widget: "Tiện ích",
    tool: "Tiện ích mở rộng",
  };

  const getHeader = () => {
    if (activeTab === "music") return { eyebrow: "Âm nhạc", title: "Nhạc nền" };
    if (selectedElement)
      return {
        eyebrow: "Đang chỉnh sửa",
        title: ELEMENT_TITLES[selectedElement.type] ?? "Phần tử",
      };
    return { eyebrow: "Thiết lập chung", title: "Cài đặt thiệp" };
  };

  const header = getHeader();

  // ==================== Main Render ====================

  return (
    <aside className="w-[350px] bg-white border-l border-line flex flex-col shrink-0 overflow-hidden h-full">
      {/* Header */}
      <header className="px-4 pt-4 pb-1 shrink-0">
        <p className="text-[13px] leading-5 text-ink-3">{header.eyebrow}</p>
        <h2 className="text-base font-semibold leading-6 text-ink">
          {header.title}
        </h2>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">{renderProperties()}</div>

      {/* Crop Modal */}
      <CropModal
        isOpen={isCropModalOpen}
        imageSrc={cropImageSrc}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </aside>
  );
};

export default Right;
