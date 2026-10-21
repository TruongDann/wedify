# Wedify — Nền tảng tạo thiệp cưới online

Dự án gồm 2 phần tách biệt:

- **`api/`** — Backend NestJS + Prisma + MySQL, cung cấp toàn bộ REST API (Auth, Invitations,
  Guests, RSVP, Wishes, Gifts/Wallet, Affiliates, Admin...). Xem chi tiết SRS đã khảo sát để biết
  toàn bộ yêu cầu chức năng.
- **(thư mục gốc)** — Frontend Next.js (editor kéo-thả thiệp cưới bằng Konva), gọi API qua
  `src/lib/api.ts` (biến `NEXT_PUBLIC_API_URL`).

## 1. Chạy Backend API

```bash
cd api
cp .env.example .env   # sửa DATABASE_URL trỏ vào MySQL 8 thật, và đổi JWT_ACCESS_SECRET/JWT_REFRESH_SECRET
npm install
npm run db:migrate     # tạo bảng trong DB
npm run db:seed        # nạp 3 gói dịch vụ Free/Basic/Premium
npm run start:dev
```

Mặc định API chạy tại `http://localhost:4000/api/v1`, Swagger docs tại
`http://localhost:4000/api/docs`.

**Postman collection đầy đủ**: import CẢ 2 file trong `api/postman/`:
- `Wedify-API.postman_collection.json` (50 request, 11 nhóm: Auth, Users, Plans, Templates,
  Invitations, Guests, RSVP, Wishes, Gifts, Wallet & Withdrawals, Affiliates)
- `Wedify-Local.postman_environment.json` (toàn bộ biến: `baseUrl`, `accessToken`,
  `adminAccessToken`, `invitationId`, `guestToken`...)

Sau khi import, **nhớ chọn Environment "Wedify - Local"** ở dropdown góc trên phải Postman
(mặc định Postman để "No Environment" — quên chọn thì `{{baseUrl}}` sẽ không có giá trị và mọi
request lỗi). Các request Register/Login/Create Invitation/Create Guest... tự động lưu
`accessToken`/`invitationId`/`guestToken`... vào Environment (không phải Collection Variables)
để chạy nối tiếp nhau không cần copy tay — xem chúng ở tab Environment thay vì tab Variables của
collection. Xem mô tả collection (phần "Overview" khi import) để biết thứ tự chạy khuyến nghị,
đặc biệt cách tạo user Admin để test nhóm Admin.

Các script hữu ích khác trong `api/`:
- `npm run db:studio` — mở Prisma Studio để xem/sửa dữ liệu trực quan.
- `npm run build` — build ra `dist/` (chạy `node dist/src/main.js` để start bản build).

## 2. Chạy Frontend (Next.js)

```bash
cp .env.local.example .env.local   # chỉnh NEXT_PUBLIC_API_URL nếu API chạy ở địa chỉ khác
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Kiến trúc tổng quan

```
wedify/
├── src/app/admin/           # Route Admin trong cùng Next.js frontend
├── src/admin/               # Toàn bộ feature/component/lib/type riêng của Admin
├── api/                     # NestJS + Prisma + MySQL
│   ├── prisma/schema.prisma # Toàn bộ data model: User, Plan, Invitation, Guest, Rsvp, Wish,
│   │                        # Gift, Wallet, Withdrawal, AffiliatePartner...
│   ├── prisma/seed.ts       # Seed 3 gói Free/Basic/Premium
│   └── src/
│       ├── auth/            # Đăng ký/đăng nhập email + JWT access+refresh, guard JWT/Role
│       ├── invitations/      # CRUD thiệp, publish, chia sẻ quyền quản lý (collaborator)
│       ├── guests/           # Cá nhân hóa link khách mời (unique token/khách)
│       ├── rsvp/             # Xác nhận tham dự + thống kê cho Host
│       ├── wishes/           # Lời chúc (guestbook) + duyệt/ẩn
│       ├── gifts/            # Quà mừng (QR ngân hàng thủ công + webhook quà ảo - STUB, xem TODO)
│       ├── wallets/          # Ví + yêu cầu rút tiền (duyệt bởi Admin)
│       ├── affiliates/       # Chương trình tiếp thị liên kết
│       ├── users/, plans/, templates/  # Quản trị (Admin Panel dùng RolesGuard)
│       └── prisma/           # PrismaService/PrismaModule dùng chung
└── src/                      # Frontend Next.js (App Router) - editor Konva, gọi API qua lib/api.ts
```

Admin dùng chung Next.js app và package với frontend, truy cập tại `http://localhost:3000/admin`.
Code quản trị được cô lập trong `src/admin/`; `src/app/admin/page.tsx` chỉ làm nhiệm vụ khai báo route.

## Việc còn phải làm trước khi lên production

- **Gifts/Wallet (`api/src/gifts/payments-webhook.controller.ts`)**: đây mới là khung/stub —
  chưa nối cổng thanh toán thật (VNPay/Momo/PayOS) và chưa xác minh chữ ký webhook. Đây là phần
  SRS tự đánh giá rủi ro/compliance cao nhất, cần làm cẩn thận trước khi cho tiền thật chạy qua.
- **Quên mật khẩu (`AuthService.forgotPassword`)**: hiện chỉ log token ra console, chưa gửi email
  thật — cần nối SMTP/SendGrid/SES khi có thông tin nhà cung cấp email.
- **Import khách hàng loạt** (`POST /invitations/:id/guests/bulk`): backend chỉ nhận mảng JSON,
  việc đọc file Excel/CSV cần làm ở frontend trước khi gửi lên.
- **Admin Panel giao diện**: mới có API (RolesGuard + @Roles(ADMIN)), chưa có giao diện quản trị.
- Cần tạo 1 user có `role: ADMIN` thủ công trong DB (hoặc qua Prisma Studio) để test các endpoint
  Admin, vì hiện chưa có UI/API "cấp quyền admin" (mặc định đăng ký luôn là `HOST`).
