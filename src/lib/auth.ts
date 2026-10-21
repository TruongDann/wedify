const USER_ACCESS_KEY = "wedify_user_access";
const USER_REFRESH_KEY = "wedify_user_refresh";
const USER_PROFILE_KEY = "wedify_user_profile";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const PLAN_TIER_ORDER = ["FREE", "BASIC", "PREMIUM"] as const;
export type PlanTierName = (typeof PLAN_TIER_ORDER)[number];

export const normalizePlanTier = (value?: string | null): PlanTierName => {
  if (!value) return "FREE";
  const normalized = String(value).toUpperCase();
  return PLAN_TIER_ORDER.includes(normalized as PlanTierName)
    ? (normalized as PlanTierName)
    : "FREE";
};

export const userAuth = {
  getAccess: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(USER_ACCESS_KEY);
  },
  getRefresh: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(USER_REFRESH_KEY);
  },
  getProfile: () => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  getCurrentPlanTier: (): PlanTierName => {
    if (typeof window === "undefined") return "PREMIUM";
    const profile = userAuth.getProfile() as Record<string, unknown> | null;
    const hasStoredSession = Boolean(userAuth.getAccess() || profile);
    if (!hasStoredSession) return "PREMIUM";

    const rawTier =
      (profile?.plan as Record<string, unknown> | null)?.tier ??
      (profile as Record<string, unknown> | null)?.tier ??
      (profile as Record<string, unknown> | null)?.planTier ??
      null;
    return normalizePlanTier(typeof rawTier === "string" ? rawTier : null);
  },
  hasPlanAccess: (requiredTier: string | null | undefined) => {
    if (typeof window !== "undefined") {
      const hasStoredSession = Boolean(userAuth.getAccess() || userAuth.getProfile());
      if (!hasStoredSession) return true;
    }

    const required = normalizePlanTier(requiredTier ?? "FREE");
    const current = userAuth.getCurrentPlanTier();
    const currentIndex = PLAN_TIER_ORDER.indexOf(current);
    const requiredIndex = PLAN_TIER_ORDER.indexOf(required);
    return currentIndex >= requiredIndex;
  },
  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_ACCESS_KEY, accessToken);
    localStorage.setItem(USER_REFRESH_KEY, refreshToken);
  },
  setProfile: (profile: unknown) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  },
  clear: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(USER_ACCESS_KEY);
    localStorage.removeItem(USER_REFRESH_KEY);
    localStorage.removeItem(USER_PROFILE_KEY);
  },
  hydrateSession: async () => {
    if (typeof window === "undefined") return null;
    const accessToken = userAuth.getAccess();
    if (!accessToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.status === 401) {
        const refreshed = await userAuth.refreshAccessToken();
        if (!refreshed) {
          userAuth.clear();
          return null;
        }
        const retry = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${refreshed}` },
        });
        if (!retry.ok) {
          userAuth.clear();
          return null;
        }
        const data = await retry.json().catch(() => null);
        if (data) userAuth.setProfile(data);
        return data;
      }

      if (!response.ok) {
        return null;
      }

      const data = await response.json().catch(() => null);
      if (data) userAuth.setProfile(data);
      return data;
    } catch {
      return null;
    }
  },

  refreshAccessToken: async () => {
    const refreshToken = userAuth.getRefresh();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        userAuth.clear();
        return null;
      }

      const data = await response.json().catch(() => null);
      if (!data?.accessToken || !data?.refreshToken) {
        userAuth.clear();
        return null;
      }

      userAuth.setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch {
      userAuth.clear();
      return null;
    }
  },

  apiFetch: async <T>(endpoint: string, init: RequestInit = {}, retry = true): Promise<T> => {
    const accessToken = userAuth.getAccess();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(init.headers || {}),
      },
    });

    if (response.status === 401 && retry) {
      const refreshed = await userAuth.refreshAccessToken();
      if (refreshed) {
        return userAuth.apiFetch<T>(endpoint, init, false);
      }
      throw new Error("Phiên đăng nhập đã hết hạn");
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Yêu cầu thất bại");
    }

    return response.json() as Promise<T>;
  },

  logout: async () => {
    const token = userAuth.getAccess();
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
      }
    } catch {
      // ignore network errors; we still clear local session
    } finally {
      userAuth.clear();
    }
  },
};
