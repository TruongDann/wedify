"use client";

import React from "react";
import { InputNumber, Button, Tooltip, Space } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

interface CanvasHeightControlProps {
  height: number;
  onChange: (height: number) => void;
  minHeight?: number;
  step?: number;
}

export const CanvasHeightControl: React.FC<CanvasHeightControlProps> = ({
  height,
  onChange,
  minHeight = 400,
  step = 100,
}) => {
  return (
    <div className="mt-4 flex items-center justify-center">
      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
        <Tooltip title="Giảm chiều dài">
          <Button
            type="text"
            size="small"
            icon={<MinusOutlined />}
            onClick={() => onChange(Math.max(minHeight, height - step))}
            disabled={height <= minHeight}
          />
        </Tooltip>
        <Space.Compact>
          <InputNumber
            value={height}
            onChange={(value) => onChange(value || minHeight)}
            min={minHeight}
            step={step}
            controls={false}
            className="w-20"
            size="small"
          />
          <Button size="small" disabled className="pointer-events-none">
            px
          </Button>
        </Space.Compact>
        <Tooltip title="Tăng chiều dài">
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => onChange(height + step)}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default CanvasHeightControl;
