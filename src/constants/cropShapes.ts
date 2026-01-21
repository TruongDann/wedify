// Crop shapes for image cropping
export const CROP_SHAPES = [
  { id: "rect", name: "Hình chữ nhật", icon: "□" },
  { id: "rounded", name: "Bo góc", icon: "▢" },
  { id: "circle", name: "Hình tròn", icon: "○" },
  { id: "oval", name: "Hình oval", icon: "⬭" },
  { id: "heart", name: "Trái tim", icon: "♥" },
  { id: "star", name: "Ngôi sao", icon: "★" },
  { id: "diamond", name: "Kim cương", icon: "◇" },
  { id: "hexagon", name: "Lục giác", icon: "⬡" },
  { id: "triangle", name: "Tam giác", icon: "△" },
  { id: "pentagon", name: "Ngũ giác", icon: "⬠" },
  { id: "octagon", name: "Bát giác", icon: "⯃" },
  { id: "arch", name: "Vòm", icon: "⌓" },
];

export const ASPECT_RATIOS = [
  { label: "Tự do", value: null },
  { label: "1:1", value: 1 },
  { label: "3:2", value: 3 / 2 },
  { label: "2:3", value: 2 / 3 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
];
