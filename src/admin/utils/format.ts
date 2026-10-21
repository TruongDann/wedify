export const formatMoney = (value = 0) => new Intl.NumberFormat("vi-VN", {
  style: "currency", currency: "VND", maximumFractionDigits: 0,
}).format(value);

export const formatDateTime = (value?: string) => value
  ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value))
  : "—";

export const statusColor = (status: string) => ({
  PAID: "green", APPROVED: "green", PUBLISHED: "green", ATTENDING: "green",
  PENDING: "gold", DRAFT: "default", FAILED: "red", REJECTED: "red",
  REFUNDED: "volcano", EXPIRED: "red", PREMIUM: "purple", BASIC: "blue", FREE: "default",
}[status] || "blue");


