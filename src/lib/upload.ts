import { userAuth } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

/** Tải ảnh của khách hàng lên máy chủ, trả về URL công khai của ảnh. */
export const uploadPhoto = async (file: File): Promise<string> => {
  const send = (token: string | null) => {
    const body = new FormData();
    body.append("file", file);
    return fetch(`${API_BASE_URL}/uploads/photos`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body,
    });
  };

  let response = await send(userAuth.getAccess());
  if (response.status === 401) {
    const refreshed = await userAuth.refreshAccessToken();
    if (!refreshed) throw new Error("Phiên đăng nhập đã hết hạn");
    response = await send(refreshed);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url) {
    throw new Error(Array.isArray(data.message) ? data.message[0] : data.message || "Không thể tải ảnh lên");
  }
  return data.url as string;
};
