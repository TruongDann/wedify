"use client";

import React, { useState, useRef, useCallback } from "react";
import { Modal, Button, message } from "antd";
import { EditOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { useEditorStore } from "@/store/editorStore";
import {
  TextElement,
  ImageElement,
  ShapeElement,
  EditorElement,
} from "@/types/editor";
import { CROP_SHAPES, ASPECT_RATIOS } from "@/constants/cropShapes";

// Import extracted components
import {
  TextStyleSection,
  PaddingSection,
  BorderSection,
  ShadowSection,
  LinkSection,
  AnimationSection,
  PositionSection,
} from "./right-panel/TextPropertySections";

import { TextEffectSection } from "./right-panel/TextEffectSection";

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
} from "./right-panel/ImagePropertySections";

import {
  ShapeColorSection,
  ShapeShadowSection,
  ShapePositionSection,
  ShapeDeleteButton,
} from "./right-panel/ShapePropertySections";

import { PageSettings } from "./right-panel/PageSettingsSection";

// ==================== Types ====================

interface RightPanelProps {
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

const RightPanel: React.FC<RightPanelProps> = ({
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
  ]);

  // Sync toggles
  const [paddingLinked, setPaddingLinked] = useState(true);
  const [borderRadiusLinked, setBorderRadiusLinked] = useState(true);
  const [sizeLinked, setSizeLinked] = useState(true);

  // Crop modal state
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [selectedShape, setSelectedShape] = useState<string>("001");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | null>(
    null
  );
  const cropperRef = useRef<ReactCropperElement>(null);

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  // ==================== Handlers ====================

  const toggleSection = (key: string) => {
    setExpandedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
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
    setSelectedShape("001");
    setSelectedAspectRatio(null);
    setIsCropModalOpen(true);
  }, []);

  const applyShapeMask = useCallback(
    (croppedCanvas: HTMLCanvasElement, shapeId: string): Promise<string> => {
      return new Promise((resolve) => {
        if (shapeId === "001") {
          resolve(croppedCanvas.toDataURL("image/png"));
          return;
        }

        const shapeData = CROP_SHAPES.find((s) => s.id === shapeId);
        if (!shapeData) {
          resolve(croppedCanvas.toDataURL("image/png"));
          return;
        }

        const shapeImg = new Image();
        shapeImg.crossOrigin = "anonymous";
        shapeImg.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = croppedCanvas.width;
          canvas.height = croppedCanvas.height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(croppedCanvas.toDataURL("image/png"));
            return;
          }

          ctx.drawImage(shapeImg, 0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = "source-in";
          ctx.drawImage(croppedCanvas, 0, 0);

          resolve(canvas.toDataURL("image/png"));
        };
        shapeImg.onerror = () => {
          resolve(croppedCanvas.toDataURL("image/png"));
        };
        shapeImg.src = shapeData.image;
      });
    },
    []
  );

  const handleCropComplete = useCallback(async () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas();
      if (croppedCanvas) {
        try {
          const croppedImageUrl = await applyShapeMask(
            croppedCanvas,
            selectedShape
          );
          if (selectedElement) {
            updateElement(selectedElement.id, { src: croppedImageUrl });
          }
          setIsCropModalOpen(false);
          message.success("Đã cắt ảnh thành công!");
        } catch {
          message.error("Có lỗi khi cắt ảnh");
        }
      }
    }
  }, [selectedElement, updateElement, selectedShape, applyShapeMask]);

  const handleAspectRatioChange = (ratio: number | null) => {
    setSelectedAspectRatio(ratio);
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.setAspectRatio(ratio === null ? NaN : ratio);
    }
  };

  // ==================== Render Functions ====================

  const renderTextProperties = (element: TextElement) => {
    const border = element.border || { width: 0, color: "#000000", style: "solid" as const, position: "all" as const };
    const borderRadius = element.borderRadius || { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };
    const shadow = element.shadow || { enabled: false, x: 0, y: 4, blur: 8, color: "rgba(0,0,0,0.2)" };
    const animation = element.animation || { enabled: false, continuous: false, type: "none" as const };

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
          onDelete={() =>
            selectedElement && deleteElement(selectedElement.id)
          }
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
          onDelete={() =>
            selectedElement && deleteElement(selectedElement.id)
          }
        />
      </div>
    );
  };

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

  const renderProperties = () => {
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

  // ==================== Main Render ====================

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden h-full">
      {/* Header */}
      <div className="h-12 px-4 border-b border-gray-200 flex items-center gap-2 shrink-0">
        <EditOutlined className="text-gray-400" />
        <span className="font-semibold text-sm">
          {selectedElement ? "Tùy chỉnh phần tử" : "Tùy chỉnh"}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">{renderProperties()}</div>

      {/* Crop Modal */}
      <Modal
        title="Cắt ảnh"
        open={isCropModalOpen}
        onCancel={() => setIsCropModalOpen(false)}
        footer={null}
        width={900}
        centered
        styles={{ body: { padding: 0 } }}
      >
        <style>
          {selectedShape !== "001"
            ? `
            .cropper-view-box,
            .cropper-face {
              -webkit-mask-image: url(${CROP_SHAPES.find((s) => s.id === selectedShape)?.image});
              mask-image: url(${CROP_SHAPES.find((s) => s.id === selectedShape)?.image});
              -webkit-mask-size: 100% 100%;
              mask-size: 100% 100%;
              -webkit-mask-repeat: no-repeat;
              mask-repeat: no-repeat;
            }
          `
            : ""}
        </style>
        <div className="flex flex-row gap-5" style={{ maxHeight: "600px" }}>
          {/* Left side - Cropper */}
          <div className="flex-1" style={{ minWidth: 0 }}>
            <div style={{ width: "100%", height: "60vh", maxHeight: "500px" }}>
              {cropImageSrc && (
                <Cropper
                  ref={cropperRef}
                  src={cropImageSrc}
                  style={{ height: "100%", width: "100%" }}
                  initialAspectRatio={NaN}
                  guides={true}
                  viewMode={1}
                  background={true}
                  responsive={true}
                  autoCropArea={0.8}
                  checkOrientation={false}
                />
              )}
            </div>
          </div>

          {/* Right side - Controls */}
          <div className="w-64 flex flex-col gap-4 pr-4 py-2">
            {/* Shape selection */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <span>Hình dạng cắt:</span>
                {selectedShape !== "001" && (
                  <span
                    className="relative inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                    style={{
                      backgroundImage: `url(${CROP_SHAPES.find((s) => s.id === selectedShape)?.image})`,
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                    onClick={() => setSelectedShape("001")}
                  >
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <CloseOutlined
                        className="!text-white"
                        style={{ fontSize: 8 }}
                      />
                    </span>
                  </span>
                )}
              </h4>
              <div
                className="grid grid-cols-4 gap-1.5 max-h-52 overflow-y-auto pr-1"
                style={{ scrollbarWidth: "thin" }}
              >
                {CROP_SHAPES.map((shape) => (
                  <button
                    key={shape.id}
                    className={`w-10 h-10 border rounded transition-all bg-contain bg-center bg-no-repeat ${
                      selectedShape === shape.id
                        ? "border-blue-500 ring-1 ring-blue-500"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    style={{
                      backgroundImage: `url(${shape.image})`,
                    }}
                    onClick={() => setSelectedShape(shape.id)}
                  />
                ))}
              </div>
            </div>

            {/* Aspect ratio selection */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Tỷ lệ khung hình
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.label}
                    className={`px-3 py-2 text-sm rounded border transition-all ${
                      selectedAspectRatio === ratio.value
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => handleAspectRatioChange(ratio.value)}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-auto pt-4 border-t border-gray-200">
              <Button
                onClick={() => setIsCropModalOpen(false)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={handleCropComplete}
                className="flex-1"
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RightPanel;
