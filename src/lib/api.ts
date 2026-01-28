/**
 * API Client
 * Base configuration for API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Make an API request
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const { method = "GET", body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Có lỗi xảy ra");
    }

    return {
      data,
      success: true,
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      data: null as T,
      success: false,
      message: error instanceof Error ? error.message : "Có lỗi xảy ra",
    };
  }
};

/**
 * GET request helper
 */
export const get = <T>(endpoint: string, headers?: Record<string, string>) => {
  return apiRequest<T>(endpoint, { method: "GET", headers });
};

/**
 * POST request helper
 */
export const post = <T>(endpoint: string, body: unknown, headers?: Record<string, string>) => {
  return apiRequest<T>(endpoint, { method: "POST", body, headers });
};

/**
 * PUT request helper
 */
export const put = <T>(endpoint: string, body: unknown, headers?: Record<string, string>) => {
  return apiRequest<T>(endpoint, { method: "PUT", body, headers });
};

/**
 * PATCH request helper
 */
export const patch = <T>(endpoint: string, body: unknown, headers?: Record<string, string>) => {
  return apiRequest<T>(endpoint, { method: "PATCH", body, headers });
};

/**
 * DELETE request helper
 */
export const del = <T>(endpoint: string, headers?: Record<string, string>) => {
  return apiRequest<T>(endpoint, { method: "DELETE", headers });
};

export default {
  get,
  post,
  put,
  patch,
  delete: del,
};
