import { createContext } from "react";

/** Dữ liệu của thiệp đã xuất bản mà các tiện ích dạng form (tham dự, sổ lưu bút, quà mừng...) cần dùng. */
export interface ViewerData {
  slug: string;
  guestToken: string | null;
  guestName: string;
  title: string;
  apiBase: string;
  profile: Record<string, any>;
}

export interface ViewerContextValue {
  data?: ViewerData;
  /** Trang xuất bản: không sửa/kéo phần tử. */
  readOnly: boolean;
  /** Xử lý khi khách bấm nút tiện ích (mở form tham dự, quà mừng, bản đồ...). */
  onAction?: (action: string, props: Record<string, any>) => void;
}

/** Null trong editor; có giá trị khi hiển thị thiệp đã xuất bản. */
export const ViewerContext = createContext<ViewerContextValue | null>(null);
