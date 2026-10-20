/**
 * Khối mẫu: các phần dựng sẵn (ảnh bìa, lời mời, ngày cưới, địa điểm...) để chèn vào cuối thiệp.
 * Toạ độ tính trên thiệp rộng 500px, y bắt đầu từ 0 — lúc chèn sẽ dời xuống dưới cùng thiệp.
 */

import type { EditorElement } from "@/types/editor";
import { DEFAULT_MEDIA } from "@/components/widgets/widgetModel";
import { GUEST_NAME_TOKEN } from "@/components/card/guestName";
import { WHITE, createBuilder, unsplash } from "./templateBuilder";

export const BLOCK_WIDTH = 500;

export interface SectionBlock {
  id: string;
  name: string;
  description: string;
  /** Biểu tượng hiển thị trên thẻ chọn khối */
  emoji: string;
  height: number;
  build: () => EditorElement[];
}

const block = (
  id: string,
  name: string,
  description: string,
  emoji: string,
  height: number,
  draw: (b: ReturnType<typeof createBuilder>) => void,
): SectionBlock => ({
  id,
  name,
  description,
  emoji,
  height,
  build: () => {
    const b = createBuilder(id);
    draw(b);
    return b.elements;
  },
});

export const SECTION_BLOCKS: SectionBlock[] = [
  block("cover", "Ảnh bìa", "Ảnh lớn, lời chào, tên cô dâu chú rể", "🖼️", 700, ({ photo, text }) => {
    photo(unsplash("1537633552985-df8429e8048b"), [0, 0, 500, 700], "fadeIn", 0);
    text("Welcome to our wedding", [70, 90, 360, 44], { font: "Prata", size: 26, color: WHITE });
    text("Minh Anh", [40, 540, 150, 32], { font: "Prata", size: 26, color: WHITE }, "slideRight");
    text("&", [220, 540, 60, 32], { font: "Allison", size: 40, color: WHITE });
    text("Hoàng Nam", [300, 540, 170, 32], { font: "Prata", size: 26, color: WHITE }, "slideLeft");
    text("20.05.2027", [136, 600, 228, 32], { font: "Italiana", size: 24, color: WHITE, spacing: 2 });
  }),
  block("invitation", "Lời mời", "Cành lá, tiêu đề, đoạn lời mời", "💌", 330, ({ decor, text }) => {
    decor("laurel-left", [168, 20, 28, 56]);
    text("WEDDING\nINVITATION", [180, 20, 140, 56], { font: "Prata", size: 18, lineHeight: 1.4 });
    decor("laurel-right", [304, 20, 28, 56]);
    text(
      "Trân trọng kính mời bạn đến chung vui\ntrong ngày trọng đại của chúng mình.\nSự hiện diện của bạn là niềm vinh hạnh\nlớn nhất với gia đình hai bên.",
      [20, 100, 460, 130],
      { font: "Cormorant Garamond", size: 19, lineHeight: 1.5 },
    );
    text("20.05.2027", [146, 260, 208, 30], { font: "Italiana", size: 24, spacing: 2 });
  }),
  block("date", "Ngày cưới", "Lịch, giờ cưới, đếm ngược, thêm vào lịch", "📅", 650, ({ text, widget }) => {
    text("SAVE THE DATE", [10, 20, 480, 36], { font: "Prata", size: 26, spacing: 3 });
    widget("calendar", [82, 70, 336, 314], { color: "#333333", accentColor: "#e8506e", borderRadius: 12 });
    text("Thứ Năm · 20.05.2027 · 11:00 sáng", [10, 400, 480, 32], { font: "Cormorant Garamond", size: 20, bold: true });
    widget("countdown", [90, 450, 320, 76], { color: WHITE, accentColor: "#940000", borderRadius: 8 });
    widget("reminder", [130, 560, 240, 48], { color: WHITE, accentColor: "#940000", borderRadius: 24 });
  }),
  block("venue", "Địa điểm", "Lời mời, bản đồ, chỉ đường", "📍", 420, ({ text, widget, decor }) => {
    text("ĐỊA ĐIỂM TỔ CHỨC", [10, 20, 480, 34], { font: "Prata", size: 24, spacing: 2 });
    widget("map", [80, 70, 340, 280], { color: "#313131", accentColor: "#940000" });
    decor("divider-flourish", [100, 370, 300, 40]);
  }),
  block("album", "Album ảnh", "Lưới 6 ảnh, bấm để xem lớn", "📷", 380, ({ text, widget }) => {
    text("ALBUM ẢNH CƯỚI", [10, 15, 480, 32], { font: "Prata", size: 22, spacing: 2 });
    widget("album", [10, 60, 480, 318], { media: DEFAULT_MEDIA, animation: { enabled: true, continuous: false, type: "fadeIn", delay: 0.2 } });
  }),
  block("slideshow", "Trình chiếu", "Ảnh tự chuyển toàn khung", "🎞️", 520, ({ text, widget }) => {
    text("KHOẢNH KHẮC", [10, 15, 480, 32], { font: "Prata", size: 22, spacing: 3 });
    widget("slideshow", [40, 60, 420, 440], { media: DEFAULT_MEDIA, borderRadius: 12 });
  }),
  block("rsvp", "Xác nhận tham dự", "Lời mời theo tên khách, form phản hồi", "✉️", 480, ({ text, widget }) => {
    text(`Trân trọng kính mời\n${GUEST_NAME_TOKEN}`, [10, 10, 480, 72], { font: "Cormorant Garamond", size: 22, bold: true, lineHeight: 1.4 });
    widget("rsvp", [70, 90, 360, 0], { backgroundColor: WHITE });
  }),
  block("gift", "Mừng cưới", "Mã QR chuyển khoản, nút gọi", "🎁", 480, ({ text, widget }) => {
    text("GỬI QUÀ MỪNG", [10, 15, 480, 32], { font: "Prata", size: 22, spacing: 2 });
    widget("giftQr", [120, 60, 260, 340], { backgroundColor: WHITE, accentColor: "#940000", borderRadius: 12 });
    widget("call", [30, 420, 210, 46], { color: WHITE, accentColor: "#5c5c5c", borderRadius: 23, button: { label: "Gọi chú rể", phone: "0900000001", eventTitle: "" } });
    widget("call", [260, 420, 210, 46], { color: WHITE, accentColor: "#5c5c5c", borderRadius: 23, button: { label: "Gọi cô dâu", phone: "0900000002", eventTitle: "" } });
  }),
  block("video", "Video", "Video YouTube của hai bạn", "▶️", 270, ({ text, widget }) => {
    text("OUR STORY", [10, 15, 480, 32], { font: "Prata", size: 22, spacing: 3 });
    widget("youtube", [40, 60, 420, 236 - 30], { borderRadius: 8 });
  }),
  block("thanks", "Lời cảm ơn", "Đôi chim, chữ Thank you", "🙏", 200, ({ decor, text }) => {
    decor("doves", [190, 10, 120, 75]);
    text("Thank you", [10, 95, 480, 90], { font: "Pacifico", size: 56 });
  }),
];
