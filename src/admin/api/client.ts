import { authStorage } from "@/admin/utils/storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function request(path: string, options: RequestInit = {}, retry = true): Promise<any> {
  const token = authStorage.getAccess();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
  });
  if (response.status === 401 && retry && authStorage.getRefresh()) {
    const refresh = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: authStorage.getRefresh() }),
    });
    if (refresh.ok) {
      const tokens = await refresh.json();
      authStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      return request(path, options, false);
    }
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(", ") : data.message || "Không thể kết nối máy chủ");
  return data;
}

export async function uploadImage(file: File) {
  const body = new FormData(); body.append("file", file);
  const token = authStorage.getAccess();
  const response = await fetch(`${API_URL}/uploads/images`, {
    method: "POST", body, headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Upload hình ảnh thất bại");
  return data as { url: string; filename: string };
}


