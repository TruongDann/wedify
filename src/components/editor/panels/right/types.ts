// Shared types for property sections
export interface FilterProps {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
}

export interface PaddingProps {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface BorderProps {
  width: number;
  color: string;
  style: "solid" | "dashed" | "dotted" | "none";
  position: "all" | "top" | "bottom" | "left" | "right";
}

export interface BorderRadiusProps {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
}

export interface ShadowProps {
  enabled: boolean;
  x: number;
  y: number;
  blur: number;
  color: string;
}

export interface AnimationProps {
  enabled: boolean;
  continuous: boolean;
  type: "none" | "fadeIn" | "slideIn" | "bounce" | "pulse" | "shake" | "zoom";
}

export interface PositionProps {
  x: number;
  y: number;
}

export interface SizeProps {
  width: number;
  height: number;
}

// Default values for properties
export const DEFAULT_FILTER: FilterProps = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
};

export const DEFAULT_PADDING: PaddingProps = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

export const DEFAULT_BORDER: BorderProps = {
  width: 0,
  color: "#000000",
  style: "solid",
  position: "all",
};

export const DEFAULT_BORDER_RADIUS: BorderRadiusProps = {
  topLeft: 0,
  topRight: 0,
  bottomLeft: 0,
  bottomRight: 0,
};

export const DEFAULT_SHADOW: ShadowProps = {
  enabled: false,
  x: 0,
  y: 4,
  blur: 8,
  color: "rgba(0,0,0,0.2)",
};

export const DEFAULT_ANIMATION: AnimationProps = {
  enabled: false,
  continuous: false,
  type: "none",
};
