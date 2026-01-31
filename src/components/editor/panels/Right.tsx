"use client";

import React, { useState, useCallback } from "react";
import { Button } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEditorStore } from "@/store/editorStore";
import {
  TextElement,
  ImageElement,
  ShapeElement,
  EditorElement,
} from "@/types/editor";

// Import extracted components
import {
  TextStyleSection,
  PaddingSection,
  BorderSection,
  ShadowSection,
  LinkSection,
  AnimationSection,
  PositionSection,
} from "./right/TextPropertySections";

import { TextEffectSection } from "./right/TextEffectSection";

import {
  ImageActionSection,
  ImageFilterSection,
  ImagePaddingSection,
  ImageBorderSection,
  ImageShadowSection,
  ImageLinkSection,
  ImageAnimationSection,
  ImagePositionSection,
  DeleteButton,
} from "./right/ImagePropertySections";

import {
  ShapeColorSection,
  ShapeShadowSection,
  ShapePositionSection,
  ShapeDeleteButton,
} from "./right/ShapePropertySections";

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
  ]);

  // Sync toggles
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
    const animation = element.animation || {
      enabled: false,
      continuous: false,
      type: "none" as const,
    };

    return (
      <div className="p-3 space-y-3">
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

        <LinkSection
          hyperlink={element.hyperlink || ""}
          isExpanded={expandedSections.includes("link")}
          onToggle={toggleSection}
          onUpdate={(updates) => handleUpdate(updates)}
        />

        <AnimationSection
          animation={animation}
          isExpanded={expandedSections.includes("animation")}
          onToggle={toggleSection}
          onUpdate={(updates) => handleUpdate(updates)}
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
    const hyperlink = element.hyperlink || "";
    const animation = element.animation || {
      enabled: false,
      continuous: false,
      type: "none" as const,
    };

    return (
      <div className="p-3 space-y-3">
        <ImageActionSection
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

        <ImageLinkSection
          hyperlink={hyperlink}
          expandedSections={expandedSections}
          onToggle={toggleSection}
          onUpdate={handleUpdate}
        />

        <ImageAnimationSection
          animation={animation}
          expandedSections={expandedSections}
          onToggle={toggleSection}
          onUpdate={handleUpdate}
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
      <div className="p-3 space-y-3">
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

  const renderPageSettings = () => (
    <>
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
      <MusicPropertySection />
    </>
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
      default:
        return renderPageSettings();
    }
  };

  // Get header text based on context
  const getHeaderText = () => {
    if (activeTab === "music") return "Tùy chỉnh nhạc nền";
    if (selectedElement) return "Tùy chỉnh phần tử";
    return "Tùy chỉnh";
  };

  // ==================== Main Render ====================

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden h-full">
      {/* Header */}
      <div className="h-12 px-4 border-b border-gray-200 flex items-center gap-2 shrink-0">
        <EditOutlined className="text-gray-400" />
        <span className="font-semibold text-sm">{getHeaderText()}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">{renderProperties()}</div>

      {/* Crop Modal */}
      <CropModal
        isOpen={isCropModalOpen}
        imageSrc={cropImageSrc}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default Right;
