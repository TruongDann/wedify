/**
 * Thông tin của thiệp đang được khách xem (trang xuất bản) để các tiện ích gốc của editor
 * (vd. form tham dự trong WidgetView) gửi dữ liệu về API thay vì chỉ lưu trên trình duyệt.
 * Ở editor / trang xem trước thì chưa đặt nên các tiện ích vẫn lưu cục bộ như cũ.
 */
export interface ViewerRuntime {
  slug: string;
  guestToken: string | null;
  guestName: string;
  apiBase: string;
}

let runtime: ViewerRuntime | null = null;

export const setViewerRuntime = (value: ViewerRuntime | null) => {
  runtime = value;
};

export const getViewerRuntime = () => runtime;
