# Wedify – design system

Chuẩn giao diện cho **toàn bộ `src/`**, lấy từ editor (`src/app/editor`, `src/components/editor`) — phần đã được làm kỹ nhất.
Trang mới hoặc trang đang sửa (dashboard, khách mời, đăng nhập, landing…) phải theo file này.

> Phạm vi: đây là giao diện **của ứng dụng** (thanh công cụ, panel, form, dashboard).
> Nội dung **trên thiệp** (chữ, màu, font người dùng chọn trong canvas / trang xem thiệp) không theo file này.

## 1. Nguồn chuẩn

| Ở đâu | Dùng cho |
|---|---|
| `src/app/globals.css` → `@theme` | Token màu, font, kích thước cho Tailwind (`bg-primary`, `text-ink-3`, `border-line`…) |
| `src/constants/theme.ts` → `appTheme` | Theme Ant Design, gắn ở `src/app/layout.tsx`. Màu trùng với token CSS |

Quy tắc:
- Chỉ dùng **class token** (`text-ink`, `border-line`, `bg-surface-muted`…). Không viết hex tay, không dùng thang màu mặc định của Tailwind (`slate-*`, `gray-*`, `blue-*`…) cho giao diện ứng dụng.
- Cần màu mới → thêm token vào **cả** `@theme` lẫn `appTheme` (nếu antd cần), rồi cập nhật bảng dưới.
- Không bọc thêm `ConfigProvider theme=…` ở trang con (trừ `locale`). Ngoại lệ hiện có: khu admin (mục 10).

## 2. Màu

Chủ đạo xanh tím, phối lavender, nền trắng.

| Token (Tailwind) | Hex | Dùng cho |
|---|---|---|
| `primary` | `#4F5BEF` | Nút chính, viền ô đang chọn, gạch chân tab, thanh trượt |
| `primary-dark` | `#3F49D1` | Trạng thái nhấn (active) của nút chính |
| `accent` | `#5865F2` | Hover nút chính; điểm cuối gradient (`from-primary to-accent`) cho nút đặc biệt (vd. "Xóa nền (AI)") |
| `primary-soft` | `#EFEBFF` | Nền mục đang chọn (chip, ô biểu tượng), hover tiêu đề section |
| `lavender` | `#C4B5FD` | Điểm nhấn trang trí, thanh cuộn |
| `link` | `#4F5BEF` | Chữ dạng link, icon/nhãn đang chọn |
| `ink` | `#1F2040` | Chữ chính, tiêu đề, icon mặc định |
| `ink-2` | `#4A4C6A` | Chữ phụ đậm, tiêu đề mục nhỏ (`SectionTitle`) |
| `ink-3` | `#6B6D8C` | Mô tả, nhãn, icon phụ, chữ tab chưa chọn |
| `ink-4` | `#A3A5BF` | Placeholder, chữ vô hiệu, icon rất mờ |
| `line` | `#E8E4F5` | Viền mặc định (panel, thẻ, ô) |
| `line-subtle` | `#F1EEF9` | Đường kẻ rất nhạt (đáy header) |
| `line-strong` | `#D6D0EC` | Viền ô nhập, chip, hover viền ô |
| `surface-subtle` | `#F8F7FF` | Nền nhẹ cho vùng nhóm, hover hàng danh sách |
| `surface-muted` | `#F3F0FF` | Hover nút icon, nền ô chưa có ảnh, mục đang chọn ở thanh bên |
| `canvas` | `#ECE8FA` | Nền vùng làm việc quanh thiệp |
| `renderer-gray` | `#e8e8e8` | Nền trang xem thiệp |

Màu trạng thái (thành công / cảnh báo / lỗi): dùng của antd (`message`, `Tag color="green|gold|red"`, `Alert type=…`), không tự đặt màu.

## 3. Chữ

- Font giao diện: **SN Pro** (`--font-ui`, đã gán cho `body` và antd). Không đặt `font-family` riêng cho UI.
- Các font khác trong `globals.css` (Dancing Script, Playfair, Montserrat…) chỉ dành cho **nội dung thiệp**.

| Vai trò | Class | Ví dụ |
|---|---|---|
| Tiêu đề panel / trang | `text-lg font-semibold text-ink` (18px) | "Văn bản", "Lớp" ở đầu panel trái |
| Tiêu đề mục | `text-[15px] font-semibold leading-[22px] text-ink` | "Đoạn phát", "Biểu tượng nhạc" |
| Tiêu đề section gập / nút | `text-sm font-semibold` (14px) | `SectionHeader`, nút antd |
| Chữ thường | `text-sm text-ink` | Nội dung panel phải |
| Mô tả, nhãn phụ | `text-[13px] leading-5 text-ink-3` | Dòng mô tả dưới tiêu đề |
| Tiêu đề nhóm nhỏ | `text-[13px] font-semibold text-ink-2` | `SectionTitle` |
| Chú thích | `text-xs text-ink-3` | Ghi chú dưới ô, số đếm |

Độ đậm: 400 thường, 500 nhãn tab chưa chọn, 600 tiêu đề / nút / mục đang chọn. Không dùng 700+ trong UI.

## 4. Bo góc, viền, bóng

| | Giá trị | Dùng cho |
|---|---|---|
| `rounded-full` | | Nút icon tròn, chip, thanh công cụ nổi, avatar |
| `rounded-2xl` (16px) | | Thẻ / khối section ở panel phải, card dashboard |
| `rounded-xl` (12px) | | Ô tìm kiếm, khối thông tin nhỏ |
| `rounded-[10px]` | = antd `borderRadius` | Ô chọn (`Tile`), ô ảnh thư viện, ô nhập |
| `rounded-lg` (8px) | = antd `borderRadiusSM` | Hàng danh sách (bảng Lớp), nút nhỏ trong hàng |

- Viền: `border border-line` mặc định; `border-line-strong` cho ô nhập / chip; `border-primary` khi đang chọn.
- Bóng: hạn chế. Chỉ dùng cho lớp nổi:
  - Thanh công cụ nổi trên canvas: `shadow-[0_4px_16px_rgba(0,0,0,0.18)]`
  - Trang thiệp trên canvas: `shadow-lg`
  - Nút nổi nhỏ (mũi tên cuộn chip): `shadow-sm`
  - Nút antd: không bóng (đã tắt trong `appTheme`).

## 5. Bố cục editor (tham chiếu cho các màn tương tự)

| Vùng | Kích thước | Class chính |
|---|---|---|
| Header | cao 64px, cố định | `h-16 bg-white border-b border-line-subtle px-6` |
| Thanh tab dọc (rail) | rộng 85px (`w-sidebar`) | Nút `h-14` icon 20 + nhãn `text-xs`; đang chọn `bg-surface-muted text-link` |
| Panel trái | 294px, gập được | `bg-white border-r border-line`; header `px-4 pt-4.5 pb-1` |
| Panel phải | 350px | `bg-white border-l border-line`; nội dung `p-4 space-y-3` |
| Vùng canvas | còn lại | nền `bg-canvas` |

Khoảng cách: lề trong panel `px-4`; khoảng giữa các khối `gap-2` / `space-y-3`; lưới ô ảnh `grid grid-cols-3 gap-2`.

## 6. Thành phần

Dùng lại cái có sẵn trước khi tự viết.

**Ant Design** (đã theme sẵn): `Button`, `Input`, `Select`, `Slider`, `Switch`, `Segmented`, `Tooltip`, `Dropdown`, `Modal`, `ColorPicker`, `InputNumber`.
- Nút chính: `<Button type="primary">`; nút phụ: `<Button>`; nút chữ: `type="text"`. Cao mặc định 36px (`controlHeight`).
- Thông báo: `const { message } = App.useApp()` (trang nằm trong `<App>`), hoặc `message.useMessage()` + `contextHolder` ở trang chưa có `<App>`. Không dùng `window.alert`.

**Thành phần riêng của editor**

| Thành phần | File | Dùng khi |
|---|---|---|
| `PanelTabs` | `src/components/editor/panels/left/ui.tsx` | Tab gạch chân trong panel |
| `Chip`, `ChipRow` | như trên | Bộ lọc dạng viên thuốc, hàng cuộn ngang |
| `Tile` | như trên | Ô chọn ảnh / mẫu, có dấu tích khi chọn |
| `SearchBox` | như trên | Ô tìm kiếm nhỏ |
| `SectionTitle`, `LinkButton` | như trên | Tiêu đề nhóm nhỏ + hành động "Xem tất cả" |
| `SectionHeader` | `src/components/editor/shared/SectionHeader.tsx` | Tiêu đề section gập/mở ở panel phải (chevron xoay 90°) |
| Thanh công cụ nổi | `src/components/editor/ElementToolbar.tsx` | Hành động trên phần tử: `rounded-full bg-white` + bóng nổi, nút `w-9 h-9 rounded-full hover:bg-surface-muted` |

**Mẫu lặp lại**
- Nút icon: `w-9 h-9 rounded-full flex items-center justify-center text-ink hover:bg-surface-muted transition-colors`, luôn có `aria-label` + `Tooltip`.
- Mục chọn được (ô, chip, hàng): mặc định `border-line`, hover `border-line-strong` hoặc `bg-surface-subtle`, đang chọn `border-primary` + `bg-primary-soft`/`bg-surface-muted` + `text-link`.
- Khối ở panel phải: `bg-white border border-line rounded-2xl` với header `px-4 py-3 font-medium text-sm border-b`.
- Trạng thái trống: chữ `text-[13px] text-ink-3` căn giữa, một câu hướng dẫn việc cần làm ("Thiệp chưa có phần tử nào.").
- Đang xử lý: `loading` của antd `Button` + đổi nhãn ("Đang xóa nền…"); việc dài thì thêm `message.loading`.

## 7. Icon

- Dùng **`lucide-react`**. Cỡ 16 trong nút / toolbar, 14 trong hàng danh sách, 20 ở thanh tab dọc (`strokeWidth={1.6}`).
- Không dùng emoji trong giao diện. `@ant-design/icons` còn ở code cũ — khi sửa file nào thì chuyển sang lucide.

## 8. Chữ trong giao diện

- Tiếng Việt, viết hoa chữ đầu câu ("Thêm hộp văn bản", không "Thêm Hộp Văn Bản").
- Ngắn, theo hành động: nút là động từ ("Nhân đôi", "Khôi phục ảnh gốc").
- Phím tắt ghi trong tooltip: `"Nhân đôi (Ctrl+D)"`.
- `aria-label`, `title`, thông báo lỗi cũng bằng tiếng Việt; lỗi nói rõ cần làm gì ("Ảnh quá nhỏ để xóa nền…, hãy dùng ảnh rõ nét hơn").
- Comment trong code: tiếng Việt, theo phong cách file đang sửa.

## 9. Tương tác

- Mọi thứ bấm được có hover (`transition-colors`) và `type="button"`.
- Vô hiệu hóa: `disabled:opacity-50 disabled:cursor-not-allowed` (antd tự xử lý).
- Ô đang focus: viền `border-primary` (`focus-within:border-primary`).
- Thao tác nhanh nên có phím tắt (xem `src/app/editor/page.tsx`), bỏ qua khi người dùng đang gõ trong ô nhập.

## 10. Ngoại lệ và nợ thiết kế hiện có

Khi sửa các chỗ này thì chuyển sang token; không nhân rộng thêm.

| Chỗ | Lệch thế nào |
|---|---|
| `src/admin/**`, `src/app/admin` | Theme riêng màu hồng `#f25f7c`, font Inter — khu quản trị nội bộ, **giữ tách biệt** cho tới khi có quyết định khác |
| `src/app/dashboard/**` (gồm trang khách mời) | Dùng `slate-*`, `emerald-*`, `cyan-*`, `amber-*` thay vì token |
| `src/app/login`, `register`, `page.tsx`, `create`, `components/invitation`, `components/dashboard` | Còn màu Tailwind mặc định |
| `src/components/editor/shared/EmptyState.tsx` | `text-gray-400` → nên là `text-ink-4`/`text-ink-3` |
| `Tile` trong `left/ui.tsx` | Dấu tích dùng hex `#3574D4` → nên là `bg-primary` |
| Nhiều file editor | Còn trộn `text-xs`/`text-sm` với cỡ px; theo bảng mục 3 khi chạm vào |

## 11. Checklist trước khi xong một giao diện

- [ ] Không có hex tay hay `slate/gray/blue-*` mới; chỉ dùng token.
- [ ] Dùng lại thành phần ở mục 6 nếu có.
- [ ] Icon lucide, cỡ đúng; nút icon có `aria-label` + tooltip.
- [ ] Chữ tiếng Việt, viết hoa đầu câu, có trạng thái trống / đang xử lý / lỗi.
- [ ] Hover, focus, disabled đầy đủ.
