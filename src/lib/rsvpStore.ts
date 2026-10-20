/**
 * RSVP Store
 * Lưu phản hồi "xác nhận tham dự" của khách. Hiện chưa có backend nên lưu tạm trên trình duyệt;
 * khi có API, thay submitRsvp bằng apiRequest("/rsvp", { method: "POST", body }) — form không cần đổi.
 */

export interface RsvpResponse {
  name: string;
  attend: string;
  guests?: number;
  side?: string;
  message?: string;
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
  const list = loadRsvps();
  list.push({ ...response, submittedAt: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(list));
};
