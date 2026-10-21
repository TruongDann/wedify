/**
 * RSVP Store
 * Lưu phản hồi "xác nhận tham dự" của khách. Hiện chưa có backend nên lưu tạm trên trình duyệt;
 * khi có API, thay submitRsvp bằng apiRequest("/rsvp", { method: "POST", body }) — form không cần đổi.
 */

import { getViewerRuntime } from "./viewerRuntime";

export interface RsvpResponse {
  name: string;
  attend: string;
  guests?: number;
  side?: string;
  message?: string;
  /** true = khách chọn "sẽ tham dự" (lựa chọn đầu tiên của form) */
  attending?: boolean;
  submittedAt: string;
}

const KEY = "wedify-rsvp";

export const loadRsvps = (): RsvpResponse[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
};

export const submitRsvp = async (
  response: Omit<RsvpResponse, "submittedAt">,
): Promise<void> => {
  // Trang xuất bản: gửi về API (tham dự theo link riêng nếu có, không thì theo tên khách nhập)
  const runtime = getViewerRuntime();
  if (runtime) {
    const note = [response.side ? `Bên: ${response.side}` : "", response.message ?? ""].filter(Boolean).join(" — ");
    const body = {
      status: response.attending === false ? "NOT_ATTENDING" : "ATTENDING",
      numberOfCompanions: Math.max(0, (response.guests ?? 1) - 1),
      note: note || undefined,
    };
    const url = runtime.guestToken
      ? `${runtime.apiBase}/guest-links/${runtime.guestToken}/rsvp`
      : `${runtime.apiBase}/invitations/by-slug/${runtime.slug}/rsvp`;
    const result = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(runtime.guestToken ? body : { ...body, name: response.name }),
    });
    if (!result.ok) {
      const data = await result.json().catch(() => ({}));
      throw new Error(Array.isArray(data.message) ? data.message[0] : data.message || "Không thể gửi xác nhận");
    }
    return;
  }

  const list = loadRsvps();
  list.push({ ...response, submittedAt: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(list));
};
