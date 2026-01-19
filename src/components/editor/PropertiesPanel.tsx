"use client";

import React from "react";
import {
  Input,
  Slider,
  Select,
  ColorPicker,
  Collapse,
  Button,
  InputNumber,
  Divider,
} from "antd";
import {
  ItalicOutlined,
  UnderlineOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { useEditorStore } from "@/store/editorStore";
import { TextElement, ImageElement, ShapeElement } from "@/types/editor";
import { loadGoogleFont } from "@/utils/fontLoader";
import { FONTS } from "@/constants/fonts";

const { Panel } = Collapse;
const { Option } = Select;

const PropertiesPanel: React.FC = () => {
  const { elements, selectedElementId, updateElement, deleteElement } =
    useEditorStore();

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className="editor-properties">
        <div className="p-6 text-center text-gray-400">
          <p>Chọn một phần tử để chỉnh sửa</p>
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<typeof selectedElement>) => {
    updateElement(selectedElement.id, updates);
  };

  const renderTextProperties = (element: TextElement) => (
    <>
      <Panel header="Nội dung" key="content">
        <Input.TextArea
          value={element.content}
          onChange={(e) => handleUpdate({ content: e.target.value })}
          rows={3}
          className="mb-3"
        />
      </Panel>

      <Panel header="Font chữ" key="font">
        <Select
          value={element.fontFamily}
          onChange={async (value) => {
            await loadGoogleFont(value);
            setTimeout(() => {
              handleUpdate({ fontFamily: value });
            }, 50);
          }}
          className="w-full mb-3"
        >
          {FONTS.map((font) => (
            <Option key={font.name} value={font.name}>
              <span style={{ fontFamily: font.name }}>{font.label}</span>
            </Option>
          ))}
        </Select>

        <div className="property-row">
          <span className="property-label">Cỡ chữ</span>
          <InputNumber
            value={element.fontSize}
            onChange={(value) => handleUpdate({ fontSize: value || 16 })}
            min={8}
            max={200}
            className="flex-1"
          />
        </div>

        <div className="property-row">
          <span className="property-label">Đậm</span>
          <Slider
            value={element.fontWeight}
            onChange={(value) => handleUpdate({ fontWeight: value })}
            min={100}
            max={900}
            step={100}
            className="flex-1"
          />
        </div>

        <div className="flex gap-1 mb-3">
          <Button
            type={element.fontStyle === "italic" ? "primary" : "default"}
            icon={<ItalicOutlined />}
            onClick={() =>
              handleUpdate({
                fontStyle: element.fontStyle === "italic" ? "normal" : "italic",
              })
            }
          />
          <Button
            type={
              element.textDecoration === "underline" ? "primary" : "default"
            }
            icon={<UnderlineOutlined />}
            onClick={() =>
              handleUpdate({
                textDecoration:
                  element.textDecoration === "underline" ? "none" : "underline",
              })
            }
          />
        </div>

        <div className="flex gap-1">
          <Button
            type={element.textAlign === "left" ? "primary" : "default"}
            icon={<AlignLeftOutlined />}
            onClick={() => handleUpdate({ textAlign: "left" })}
          />
          <Button
            type={element.textAlign === "center" ? "primary" : "default"}
            icon={<AlignCenterOutlined />}
            onClick={() => handleUpdate({ textAlign: "center" })}
          />
          <Button
            type={element.textAlign === "right" ? "primary" : "default"}
            icon={<AlignRightOutlined />}
            onClick={() => handleUpdate({ textAlign: "right" })}
          />
        </div>
      </Panel>

      <Panel header="Màu sắc" key="colors">
        <div className="property-row">
          <span className="property-label">Màu chữ</span>
          <ColorPicker
            value={element.color}
            onChange={(color) => handleUpdate({ color: color.toHexString() })}
            showText
          />
        </div>
      </Panel>

      <Panel header="Khoảng cách" key="spacing">
        <div className="property-row">
          <span className="property-label">Dòng</span>
          <Slider
            value={element.lineHeight}
            onChange={(value) => handleUpdate({ lineHeight: value })}
            min={0.5}
            max={3}
            step={0.1}
            className="flex-1"
          />
        </div>
        <div className="property-row">
          <span className="property-label">Chữ</span>
          <Slider
            value={element.letterSpacing}
            onChange={(value) => handleUpdate({ letterSpacing: value })}
            min={-5}
            max={20}
            step={0.5}
            className="flex-1"
          />
        </div>
      </Panel>
    </>
  );

  const renderImageProperties = (element: ImageElement) => {
    // Default values for new properties
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
      <>
        <Panel header="Hiển thị" key="display">
          <div className="property-row">
            <span className="property-label">Fit</span>
            <Select
              value={element.objectFit}
              onChange={(value) => handleUpdate({ objectFit: value })}
              className="flex-1"
            >
              <Option value="cover">Cover</Option>
              <Option value="contain">Contain</Option>
              <Option value="fill">Fill</Option>
            </Select>
          </div>
        </Panel>

        <Panel header="Bo góc" key="border">
          <div className="property-row">
            <span className="property-label">Bán kính</span>
            <Slider
              value={borderRadius.topLeft}
              onChange={(value) =>
                handleUpdate({
                  borderRadius: {
                    topLeft: value,
                    topRight: value,
                    bottomLeft: value,
                    bottomRight: value,
                  },
                })
              }
              min={0}
              max={100}
              className="flex-1"
            />
          </div>

          <Divider className="my-2" />

          <div className="property-row">
            <span className="property-label">Viền</span>
            <InputNumber
              value={element.border.width}
              onChange={(value) =>
                handleUpdate({
                  border: { ...element.border, width: value || 0 },
                })
              }
              min={0}
              max={20}
            />
          </div>

          {element.border.width > 0 && (
            <div className="property-row">
              <span className="property-label">Màu viền</span>
              <ColorPicker
                value={element.border.color}
                onChange={(color) =>
                  handleUpdate({
                    border: { ...element.border, color: color.toHexString() },
                  })
                }
                showText
              />
            </div>
          )}
        </Panel>

        <Panel header="Đổ bóng" key="shadow">
          <div className="property-row">
            <span className="property-label">Blur</span>
            <Slider
              value={shadow.blur}
              onChange={(value) =>
                handleUpdate({ shadow: { ...shadow, blur: value } })
              }
              min={0}
              max={50}
              className="flex-1"
            />
          </div>
          <div className="property-row">
            <span className="property-label">X</span>
            <Slider
              value={shadow.x}
              onChange={(value) =>
                handleUpdate({ shadow: { ...shadow, x: value } })
              }
              min={-20}
              max={20}
              className="flex-1"
            />
          </div>
          <div className="property-row">
            <span className="property-label">Y</span>
            <Slider
              value={shadow.y}
              onChange={(value) =>
                handleUpdate({ shadow: { ...shadow, y: value } })
              }
              min={-20}
              max={20}
              className="flex-1"
            />
          </div>
        </Panel>
      </>
    );
  };

  const renderShapeProperties = (element: ShapeElement) => (
    <>
      <Panel header="Màu sắc" key="colors">
        <div className="property-row">
          <span className="property-label">Màu nền</span>
          <ColorPicker
            value={element.fill}
            onChange={(color) => handleUpdate({ fill: color.toHexString() })}
            showText
          />
        </div>
        <div className="property-row">
          <span className="property-label">Viền</span>
          <ColorPicker
            value={element.stroke}
            onChange={(color) => handleUpdate({ stroke: color.toHexString() })}
            showText
          />
        </div>
        <div className="property-row">
          <span className="property-label">Độ dày</span>
          <Slider
            value={element.strokeWidth}
            onChange={(value) => handleUpdate({ strokeWidth: value })}
            min={0}
            max={20}
            className="flex-1"
          />
        </div>
      </Panel>
    </>
  );

  return (
    <div className="editor-properties">
      <div className="properties-section">
        <div className="flex justify-between items-center mb-2">
          <span className="properties-title">
            {selectedElement.type === "text" && "Văn bản"}
            {selectedElement.type === "image" && "Hình ảnh"}
            {selectedElement.type === "shape" && "Hình khối"}
          </span>
          <div className="flex gap-1">
            <Button
              size="small"
              icon={
                selectedElement.locked ? <LockOutlined /> : <UnlockOutlined />
              }
              onClick={() => handleUpdate({ locked: !selectedElement.locked })}
            />
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteElement(selectedElement.id)}
            />
          </div>
        </div>
      </div>

      <Collapse
        defaultActiveKey={["content", "font", "colors", "display"]}
        ghost
      >
        {/* Common properties */}
        <Panel header="Vị trí & Kích thước" key="position">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">X</label>
              <InputNumber
                size="small"
                value={Math.round(selectedElement.position.x)}
                onChange={(value) =>
                  handleUpdate({
                    position: { ...selectedElement.position, x: value || 0 },
                  })
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Y</label>
              <InputNumber
                size="small"
                value={Math.round(selectedElement.position.y)}
                onChange={(value) =>
                  handleUpdate({
                    position: { ...selectedElement.position, y: value || 0 },
                  })
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Rộng</label>
              <InputNumber
                size="small"
                value={Math.round(selectedElement.size.width)}
                onChange={(value) =>
                  handleUpdate({
                    size: { ...selectedElement.size, width: value || 50 },
                  })
                }
                min={20}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Cao</label>
              <InputNumber
                size="small"
                value={Math.round(selectedElement.size.height)}
                onChange={(value) =>
                  handleUpdate({
                    size: { ...selectedElement.size, height: value || 50 },
                  })
                }
                min={20}
                className="w-full"
              />
            </div>
          </div>

          <div className="property-row mt-3">
            <span className="property-label">Xoay</span>
            <Slider
              value={selectedElement.rotation}
              onChange={(value) => handleUpdate({ rotation: value })}
              min={-180}
              max={180}
              className="flex-1"
            />
          </div>
        </Panel>

        <Panel header="Độ trong suốt" key="opacity">
          <Slider
            value={selectedElement.opacity}
            onChange={(value) => handleUpdate({ opacity: value })}
            min={0}
            max={1}
            step={0.01}
          />
        </Panel>

        {/* Type-specific properties */}
        {selectedElement.type === "text" &&
          renderTextProperties(selectedElement)}
        {selectedElement.type === "image" &&
          renderImageProperties(selectedElement)}
        {selectedElement.type === "shape" &&
          renderShapeProperties(selectedElement)}
      </Collapse>
    </div>
  );
};

export default PropertiesPanel;
