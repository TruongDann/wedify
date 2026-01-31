"use client";

import React, { useRef, useCallback, useState } from "react";
import { Modal, Button, App } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { CROP_SHAPES, ASPECT_RATIOS } from "@/constants/cropShapes";

interface CropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string) => void;
}

// Shape Selection Component
interface ShapeSelectorProps {
  selectedShape: string;
  onSelectShape: (shapeId: string) => void;
}

const ShapeSelector: React.FC<ShapeSelectorProps> = ({
  selectedShape,
  onSelectShape,
}) => (
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
          onClick={() => onSelectShape("001")}
        >
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
            <CloseOutlined className="text-white!" style={{ fontSize: 8 }} />
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
          style={{ backgroundImage: `url(${shape.image})` }}
          onClick={() => onSelectShape(shape.id)}
        />
      ))}
    </div>
  </div>
);

// Aspect Ratio Selector Component
interface AspectRatioSelectorProps {
  selectedRatio: number | null;
  onSelectRatio: (ratio: number | null) => void;
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  selectedRatio,
  onSelectRatio,
}) => (
  <div>
    <h4 className="text-sm font-medium text-gray-700 mb-2">Tỷ lệ khung hình</h4>
    <div className="grid grid-cols-2 gap-2">
      {ASPECT_RATIOS.map((ratio) => (
        <button
          key={ratio.label}
          className={`px-3 py-2 text-sm rounded border transition-all ${
            selectedRatio === ratio.value
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
          }`}
          onClick={() => onSelectRatio(ratio.value)}
        >
          {ratio.label}
        </button>
      ))}
    </div>
  </div>
);

export const CropModal: React.FC<CropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}) => {
  const { message } = App.useApp();
  const cropperRef = useRef<ReactCropperElement>(null);
  const [selectedShape, setSelectedShape] = useState<string>("001");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | null>(
    null,
  );

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
    [],
  );

  const handleCropComplete = useCallback(async () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas();
      if (croppedCanvas) {
        try {
          const croppedImageUrl = await applyShapeMask(
            croppedCanvas,
            selectedShape,
          );
          onCropComplete(croppedImageUrl);
          message.success("Đã cắt ảnh thành công!");
        } catch {
          message.error("Có lỗi khi cắt ảnh");
        }
      }
    }
  }, [selectedShape, applyShapeMask, onCropComplete, message]);

  const handleAspectRatioChange = (ratio: number | null) => {
    setSelectedAspectRatio(ratio);
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.setAspectRatio(ratio === null ? NaN : ratio);
    }
  };

  const handleClose = () => {
    setSelectedShape("001");
    setSelectedAspectRatio(null);
    onClose();
  };

  return (
    <Modal
      title="Cắt ảnh"
      open={isOpen}
      onCancel={handleClose}
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
            {imageSrc && (
              <Cropper
                ref={cropperRef}
                src={imageSrc}
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
          <ShapeSelector
            selectedShape={selectedShape}
            onSelectShape={setSelectedShape}
          />

          <AspectRatioSelector
            selectedRatio={selectedAspectRatio}
            onSelectRatio={handleAspectRatioChange}
          />

          {/* Action buttons */}
          <div className="flex gap-2 mt-auto pt-4 border-t border-gray-200">
            <Button onClick={handleClose} className="flex-1">
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
  );
};

export default CropModal;
