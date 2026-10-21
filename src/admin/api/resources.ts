import type { ModuleKey, ResourceModuleKey } from "@/admin/types";

export type ResourceField = {
  name: string;
  label: string;
  required?: boolean;
  type?: "password" | "number" | "date" | "json";
  options?: string[];
  lookup?: "users" | "plans" | "templates" | "categories" | "styles" | "components";
};
export const resourceEndpoints: Record<ResourceModuleKey, string> = { users: "/users", invitations: "/admin/invitations", templates: "/templates", components: "/components", plans: "/plans", subscriptions: "/admin/subscriptions", withdrawals: "/admin/withdrawals", gifts: "/admin/gifts", affiliates: "/affiliates", wishes: "/admin/wishes" };

export const resourceFields: Partial<Record<ModuleKey, ResourceField[]>> = {
  users: [{ name: "email", label: "Email", required: true }, { name: "password", label: "Mật khẩu", required: true, type: "password" }, { name: "name", label: "Họ tên" }, { name: "phone", label: "Số điện thoại" }, { name: "role", label: "Vai trò", options: ["HOST", "ADMIN"] }, { name: "planId", label: "Gói dịch vụ", lookup: "plans" }],
  invitations: [{ name: "userId", label: "Chủ sở hữu", required: true, lookup: "users" }, { name: "templateId", label: "Template", lookup: "templates" }, { name: "title", label: "Tên thiệp", required: true }, { name: "location", label: "Địa điểm" }, { name: "eventDate", label: "Ngày sự kiện", type: "date" }, { name: "status", label: "Trạng thái", options: ["DRAFT", "PUBLISHED", "EXPIRED"] }],
  templates: [{ name: "name", label: "Tên template", required: true }, { name: "categoryId", label: "Danh mục", required: true, lookup: "categories" }, { name: "styleId", label: "Phong cách", lookup: "styles" }, { name: "tier", label: "Cấp độ", options: ["FREE", "BASIC", "PREMIUM"] }, { name: "thumbnailUrl", label: "Ảnh đại diện", required: true }],
  components: [{ name: "name", label: "Tên component", required: true }, { name: "type", label: "Loại", required: true, options: ["text", "image", "shape", "background", "music"] }, { name: "category", label: "Nhóm", required: true, options: ["wedding", "birthday", "luxury", "celebration", "event", "general"] }, { name: "tier", label: "Gói kích hoạt", options: ["FREE", "BASIC", "PREMIUM"] }, { name: "thumbnailUrl", label: "Ảnh preview" }, { name: "description", label: "Mô tả" }, { name: "configJson", label: "Cấu hình option", type: "json" }, { name: "sortOrder", label: "Thứ tự hiển thị", type: "number" }],
  plans: [{ name: "name", label: "Tên gói" }, { name: "price", label: "Giá", type: "number" }, { name: "maxImages", label: "Số ảnh", type: "number" }, { name: "maxViews", label: "Lượt xem", type: "number" }, { name: "maxInvitations", label: "Số thiệp", type: "number" }, { name: "storageDurationMonths", label: "Tháng lưu trữ", type: "number" }],
  subscriptions: [{ name: "userId", label: "Người dùng", required: true, lookup: "users" }, { name: "planId", label: "Gói dịch vụ", required: true, lookup: "plans" }, { name: "amountPaid", label: "Số tiền", required: true, type: "number" }, { name: "expiresAt", label: "Ngày hết hạn", required: true, type: "date" }, { name: "paymentStatus", label: "Trạng thái", options: ["PENDING", "PAID", "FAILED", "REFUNDED"] }],
};


